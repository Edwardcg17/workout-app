import { db } from "./db";
import { builtInUnits, defaultSettings, makeId, nowIso } from "./seed";
import { exerciseUsage, normalizeName, unitUsage, validateExerciseName, validateUnitName } from "./validation";
import type { AppData, Comment, DayLog, ExerciseDef, ID, Settings, Unit, Workout, WorkoutExercise } from "../types";

export async function initializeData() {
  const unitCount = await db.units.count();
  if (unitCount === 0) await db.units.bulkPut(builtInUnits());
  const settings = await db.settings.get("settings");
  if (!settings) await db.settings.put(defaultSettings());
}

export async function loadAppData(): Promise<AppData> {
  await initializeData();
  const [units, exercises, days, workouts, settings] = await Promise.all([
    db.units.orderBy("createdAt").toArray(),
    db.exercises.orderBy("name").toArray(),
    db.days.toArray(),
    db.workouts.orderBy("createdAt").toArray(),
    db.settings.get("settings")
  ]);
  return { units, exercises, days, workouts, settings: settings || defaultSettings() };
}

export async function saveSettings(partial: Partial<Settings>) {
  const current = (await db.settings.get("settings")) || defaultSettings();
  await db.settings.put({ ...current, ...partial, id: "settings" });
}

export async function saveDayLog(log: DayLog) {
  const cleaned: DayLog = { date: log.date };
  (["weight", "calories", "proteinG", "carbsG", "fatG"] as const).forEach((key) => {
    const value = log[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) cleaned[key] = value;
  });
  if (log.weightUnit) cleaned.weightUnit = log.weightUnit;
  const hasMetrics = cleaned.weight !== undefined || cleaned.calories !== undefined || cleaned.proteinG !== undefined || cleaned.carbsG !== undefined || cleaned.fatG !== undefined;
  if (!hasMetrics) {
    await db.days.delete(log.date);
    return;
  }
  await db.days.put(cleaned);
}

export async function createWorkout(date: string) {
  const workout: Workout = { id: makeId(), date, createdAt: nowIso(), comments: [], exercises: [] };
  await db.workouts.put(workout);
  return workout;
}

export async function saveWorkout(workout: Workout) {
  await db.workouts.put(workout);
}

export async function deleteWorkout(id: ID) {
  await db.workouts.delete(id);
}

export async function duplicateWorkout(workout: Workout, date: string) {
  const copy: Workout = {
    id: makeId(),
    date,
    name: workout.name,
    createdAt: nowIso(),
    comments: workout.comments.map((comment) => ({ ...comment, id: makeId() })),
    exercises: workout.exercises.map((entry) => ({
      id: makeId(),
      exerciseId: entry.exerciseId,
      sets: entry.sets.map((set) => ({
        ...set,
        id: makeId(),
        comments: set.comments.map((comment) => ({ ...comment, id: makeId() }))
      }))
    }))
  };
  await db.workouts.put(copy);
  return copy;
}

export async function createUnit(name: string, kind: Unit["kind"], data?: AppData) {
  const appData = data || await loadAppData();
  const error = validateUnitName(name, kind, appData.units);
  if (error) throw new Error(error);
  const unit: Unit = { id: makeId(), name: name.trim().replace(/\s+/g, " "), kind, builtIn: false, archived: false, createdAt: nowIso() };
  await db.units.put(unit);
  return unit;
}

export async function updateUnit(unit: Unit, updates: Partial<Pick<Unit, "name" | "archived">>, data?: AppData) {
  const appData = data || await loadAppData();
  if (unit.builtIn && updates.name !== undefined && updates.name !== unit.name) throw new Error("Built-in units cannot be renamed.");
  if (updates.name !== undefined) {
    const error = validateUnitName(updates.name, unit.kind, appData.units, unit.id);
    if (error) throw new Error(error);
  }
  await db.units.put({ ...unit, ...updates, name: updates.name?.trim().replace(/\s+/g, " ") || unit.name });
}

export async function deleteOrArchiveUnit(unit: Unit, data?: AppData) {
  const appData = data || await loadAppData();
  if (unit.builtIn) throw new Error("Built-in units cannot be deleted.");
  const extraIds = [
    ...appData.exercises.flatMap((exercise) => [exercise.defaultLoadUnitId, exercise.defaultRepsUnitId]),
    appData.settings.defaultLoadUnitId
  ];
  if (unitUsage(unit.id, appData.workouts, extraIds) > 0) {
    await db.units.put({ ...unit, archived: true });
    return "archived" as const;
  }
  await db.units.delete(unit.id);
  return "deleted" as const;
}

export async function createExercise(name: string, defaultLoadUnitId: ID, defaultRepsUnitId: ID, data?: AppData) {
  const appData = data || await loadAppData();
  const error = validateExerciseName(name, appData.exercises);
  if (error) throw new Error(error);
  const exercise: ExerciseDef = {
    id: makeId(),
    name: name.trim().replace(/\s+/g, " "),
    defaultLoadUnitId,
    defaultRepsUnitId,
    archived: false,
    createdAt: nowIso()
  };
  await db.exercises.put(exercise);
  return exercise;
}

export async function updateExercise(exercise: ExerciseDef, updates: Partial<ExerciseDef>, data?: AppData) {
  const appData = data || await loadAppData();
  if (updates.name !== undefined) {
    const error = validateExerciseName(updates.name, appData.exercises, exercise.id);
    if (error) throw new Error(error);
  }
  await db.exercises.put({ ...exercise, ...updates, name: updates.name?.trim().replace(/\s+/g, " ") || exercise.name });
}

export async function deleteOrArchiveExercise(exercise: ExerciseDef, data?: AppData) {
  const appData = data || await loadAppData();
  if (exerciseUsage(exercise.id, appData.workouts) > 0) {
    await db.exercises.put({ ...exercise, archived: true });
    return "archived" as const;
  }
  await db.exercises.delete(exercise.id);
  return "deleted" as const;
}

export function commentFromText(text: string): Comment {
  return { id: makeId(), text, createdAt: nowIso() };
}

export function workoutDisplayName(workout: Workout, dayWorkouts: Workout[]) {
  if (workout.name?.trim()) return workout.name;
  const index = dayWorkouts.findIndex((item) => item.id === workout.id);
  return `Workout ${index + 1}`;
}

export function addExerciseToWorkout(workout: Workout, exercise: ExerciseDef): Workout {
  const entry: WorkoutExercise = { id: makeId(), exerciseId: exercise.id, sets: [] };
  return { ...workout, exercises: [...workout.exercises, entry] };
}

export function isReferencedExercise(exerciseId: ID, workouts: Workout[]) {
  return workouts.some((workout) => workout.exercises.some((entry) => entry.exerciseId === exerciseId));
}

export function unitLabel(id: ID, units: Unit[]) {
  return units.find((unit) => unit.id === id)?.name || "Unknown";
}

export function exerciseLabel(id: ID, exercises: ExerciseDef[]) {
  return exercises.find((exercise) => exercise.id === id)?.name || "Deleted exercise";
}

export function findExerciseByName(name: string, exercises: ExerciseDef[]) {
  const normalized = normalizeName(name);
  return exercises.find((exercise) => normalizeName(exercise.name) === normalized);
}
