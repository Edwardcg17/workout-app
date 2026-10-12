export type ID = string;
export type Tab = "calendar" | "graphs" | "library";

export interface Comment {
  id: ID;
  text: string;
  createdAt: string;
}

export interface Unit {
  id: ID;
  name: string;
  kind: "load" | "reps";
  builtIn: boolean;
  archived: boolean;
  createdAt: string;
}

export interface ExerciseDef {
  id: ID;
  name: string;
  defaultLoadUnitId: ID;
  defaultRepsUnitId: ID;
  archived: boolean;
  createdAt: string;
}

export interface DayLog {
  date: string;
  weight?: number;
  weightUnit?: "kg" | "lb";
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

export interface Workout {
  id: ID;
  date: string;
  name?: string;
  createdAt: string;
  comments: Comment[];
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: ID;
  exerciseId: ID;
  sets: SetEntry[];
}

export interface RangeValue {
  min: number;
  max?: number;
}

export interface SetEntry {
  id: ID;
  load?: number;
  loadUnitId: ID;
  reps?: number;
  rir?: RangeValue;
  repsUnitId: ID;
  comments: Comment[];
}

export interface Settings {
  id: "settings";
  defaultWeightUnit: "kg" | "lb";
  defaultLoadUnitId: ID;
  weekStartsOn: 0 | 1;
  lastExportedAt?: string;
  lastGraphSelection?: string;
  graphRange?: GraphRange;
}

export type GraphRange = "1M" | "3M" | "6M" | "1Y" | "All";

export interface AppData {
  units: Unit[];
  exercises: ExerciseDef[];
  days: DayLog[];
  workouts: Workout[];
  settings: Settings;
}

export interface ExportPayload {
  schemaVersion: 1;
  exportedAt: string;
  units: Unit[];
  exercises: ExerciseDef[];
  days: DayLog[];
  workouts: Workout[];
  settings: Settings;
}
