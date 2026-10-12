export const APP_BASE = "/workout-app/";
export const SCHEMA_VERSION = 1;
export const DB_NAME = "workout-body-tracker";
export const KG_TO_LB = 2.20462;
export const DEFAULT_WEIGHT_UNIT = "lb";
export const BACKUP_REMINDER_DAYS = 30;

export const BUILT_IN_UNIT_IDS = {
  kg: "unit-load-kg",
  lb: "unit-load-lb",
  reps: "unit-reps-reps",
  sec: "unit-reps-sec",
  min: "unit-reps-min"
} as const;
