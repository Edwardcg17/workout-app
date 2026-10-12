import { BUILT_IN_UNIT_IDS, DEFAULT_WEIGHT_UNIT } from "../constants";
import type { Settings, Unit } from "../types";

export function nowIso() {
  return new Date().toISOString();
}

export function makeId() {
  return crypto.randomUUID();
}

export function builtInUnits(createdAt = nowIso()): Unit[] {
  return [
    { id: BUILT_IN_UNIT_IDS.kg, name: "kg", kind: "load", builtIn: true, archived: false, createdAt },
    { id: BUILT_IN_UNIT_IDS.lb, name: "lb", kind: "load", builtIn: true, archived: false, createdAt },
    { id: BUILT_IN_UNIT_IDS.reps, name: "reps", kind: "reps", builtIn: true, archived: false, createdAt },
    { id: BUILT_IN_UNIT_IDS.sec, name: "sec", kind: "reps", builtIn: true, archived: false, createdAt },
    { id: BUILT_IN_UNIT_IDS.min, name: "min", kind: "reps", builtIn: true, archived: false, createdAt }
  ];
}

export function defaultSettings(): Settings {
  return {
    id: "settings",
    defaultWeightUnit: DEFAULT_WEIGHT_UNIT,
    defaultLoadUnitId: BUILT_IN_UNIT_IDS.lb,
    weekStartsOn: 0,
    graphRange: "3M",
    lastGraphSelection: "bodyweight"
  };
}
