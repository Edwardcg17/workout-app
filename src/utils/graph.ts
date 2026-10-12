import { KG_TO_LB } from "../constants";
import type { AppData, GraphRange, SetEntry } from "../types";
import { daysBetween, startDateForRange } from "./dates";

export interface ChartPoint {
  id: string;
  date: string;
  value: number;
  label: string;
  detail: string;
  set?: SetEntry;
}

export function filterByRange<T extends { date: string }>(items: T[], range: GraphRange) {
  const start = startDateForRange(range);
  return start ? items.filter((item) => item.date >= start) : items;
}

export function bodyweightPoints(data: AppData, range: GraphRange): ChartPoint[] {
  return filterByRange(data.days, range)
    .filter((day) => day.weight !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => {
      const sourceUnit = day.weightUnit || data.settings.defaultWeightUnit;
      const value = sourceUnit === data.settings.defaultWeightUnit ? day.weight! : data.settings.defaultWeightUnit === "lb" ? day.weight! * KG_TO_LB : day.weight! / KG_TO_LB;
      return { id: day.date, date: day.date, value, label: `${value.toFixed(1)} ${data.settings.defaultWeightUnit}`, detail: sourceUnit === data.settings.defaultWeightUnit ? "" : `Original: ${day.weight} ${sourceUnit}` };
    });
}

function rirMin(set: SetEntry) {
  return set.rir?.min ?? Number.POSITIVE_INFINITY;
}

export function exerciseUnitIds(data: AppData, exerciseId: string, range: GraphRange, metric: "load" | "reps") {
  const ids = new Set<string>();
  filterByRange(data.workouts, range).forEach((workout) => workout.exercises.filter((entry) => entry.exerciseId === exerciseId).forEach((entry) => entry.sets.forEach((set) => {
    if (metric === "load" && set.load !== undefined) ids.add(set.loadUnitId);
    if (metric === "reps" && set.reps !== undefined) ids.add(set.repsUnitId);
  })));
  return [...ids];
}

export function exercisePoints(data: AppData, exerciseId: string, range: GraphRange, unitId: string, metric: "load" | "reps"): ChartPoint[] {
  const byDay = new Map<string, SetEntry[]>();
  filterByRange(data.workouts, range).forEach((workout) => workout.exercises.filter((entry) => entry.exerciseId === exerciseId).forEach((entry) => entry.sets.forEach((set) => {
    const value = metric === "load" ? set.load : set.reps;
    const setUnitId = metric === "load" ? set.loadUnitId : set.repsUnitId;
    if (value !== undefined && setUnitId === unitId) byDay.set(workout.date, [...(byDay.get(workout.date) || []), set]);
  })));
  return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, sets]) => {
    const top = [...sets].sort((a, b) => {
      const primary = (metric === "load" ? b.load! - a.load! : b.reps! - a.reps!);
      if (primary !== 0) return primary;
      if (a.repsUnitId === b.repsUnitId && a.reps !== undefined && b.reps !== undefined && b.reps !== a.reps) return b.reps - a.reps;
      if (a.repsUnitId === b.repsUnitId) return rirMin(a) - rirMin(b);
      return 0;
    })[0];
    const unit = data.units.find((item) => item.id === unitId)?.name || "";
    const loadUnit = data.units.find((item) => item.id === top.loadUnitId)?.name || "";
    const repsUnit = data.units.find((item) => item.id === top.repsUnitId)?.name || "";
    const rir = top.rir ? ` @ RIR ${top.rir.max === undefined ? top.rir.min : `${top.rir.min}-${top.rir.max}`} ${repsUnit}` : "";
    return {
      id: `${date}-${top.id}`,
      date,
      value: metric === "load" ? top.load! : top.reps!,
      label: `${metric === "load" ? top.load : top.reps} ${unit}`,
      detail: `${top.load ?? "No load"} ${loadUnit} x ${top.reps ?? "-"} ${repsUnit}${rir}`,
      set: top
    };
  });
}

export function pointX(date: string, minDate: string, maxDate: string, width: number) {
  const total = Math.max(1, daysBetween(minDate, maxDate));
  return (daysBetween(minDate, date) / total) * width;
}
