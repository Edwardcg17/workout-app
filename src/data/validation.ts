import type { ExerciseDef, Unit, Workout } from "../types";

export function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function unitUsage(unitId: string, workouts: Workout[], extraIds: string[] = []) {
  let count = 0;
  workouts.forEach((workout) => workout.exercises.forEach((exercise) => exercise.sets.forEach((set) => {
    if (set.loadUnitId === unitId) count += 1;
    if (set.repsUnitId === unitId) count += 1;
  })));
  extraIds.forEach((id) => { if (id === unitId) count += 1; });
  return count;
}

export function exerciseUsage(exerciseId: string, workouts: Workout[]) {
  let count = 0;
  workouts.forEach((workout) => workout.exercises.forEach((exercise) => {
    if (exercise.exerciseId === exerciseId) count += exercise.sets.length || 1;
  }));
  return count;
}

export function validateExerciseName(name: string, exercises: ExerciseDef[], currentId?: string) {
  const normalized = normalizeName(name);
  if (!normalized) return "Name is required.";
  if (exercises.some((exercise) => exercise.id !== currentId && normalizeName(exercise.name) === normalized)) {
    return "Exercise names must be unique.";
  }
  return undefined;
}

export function validateUnitName(name: string, kind: Unit["kind"], units: Unit[], currentId?: string) {
  const normalized = normalizeName(name);
  if (!normalized) return "Name is required.";
  if (units.some((unit) => unit.id !== currentId && unit.kind === kind && normalizeName(unit.name) === normalized)) {
    return "Unit names must be unique within their type.";
  }
  return undefined;
}
