import Dexie, { type Table } from "dexie";
import { DB_NAME } from "../constants";
import type { DayLog, ExerciseDef, Settings, Unit, Workout } from "../types";

export class WorkoutDatabase extends Dexie {
  units!: Table<Unit, string>;
  exercises!: Table<ExerciseDef, string>;
  days!: Table<DayLog, string>;
  workouts!: Table<Workout, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      units: "id, kind, archived",
      exercises: "id, name, archived",
      days: "date",
      workouts: "id, date",
      settings: "id"
    });
  }
}

export const db = new WorkoutDatabase();
