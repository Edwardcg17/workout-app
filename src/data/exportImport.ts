import { SCHEMA_VERSION } from "../constants";
import type { AppData, ExportPayload, ID, Settings } from "../types";
import { db } from "./db";
import { loadAppData, saveSettings } from "./repository";

export async function createExportPayload(): Promise<ExportPayload> {
  const data = await loadAppData();
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    units: data.units,
    exercises: data.exercises,
    days: data.days,
    workouts: data.workouts,
    settings: { ...data.settings, lastExportedAt: new Date().toISOString() }
  };
}

export function validateImportPayload(payload: unknown): { data?: ExportPayload; error?: string } {
  if (!payload || typeof payload !== "object") return { error: "Backup file is not valid JSON data." };
  const candidate = payload as ExportPayload;
  if (candidate.schemaVersion !== SCHEMA_VERSION) return { error: "Unsupported backup schema version." };
  if (!Array.isArray(candidate.units) || !Array.isArray(candidate.exercises) || !Array.isArray(candidate.days) || !Array.isArray(candidate.workouts)) {
    return { error: "Backup is missing required tables." };
  }

  const unitIds = new Set<ID>(candidate.units.map((unit) => unit.id));
  const exerciseIds = new Set<ID>(candidate.exercises.map((exercise) => exercise.id));
  if (candidate.exercises.some((exercise) => !unitIds.has(exercise.defaultLoadUnitId) || !unitIds.has(exercise.defaultRepsUnitId))) {
    return { error: "Backup has an exercise that references a missing unit." };
  }
  if (candidate.settings?.defaultLoadUnitId && !unitIds.has(candidate.settings.defaultLoadUnitId)) {
    return { error: "Backup settings reference a missing load unit." };
  }
  for (const workout of candidate.workouts) {
    for (const entry of workout.exercises || []) {
      if (!exerciseIds.has(entry.exerciseId)) return { error: "Backup has a workout that references a missing exercise." };
      for (const set of entry.sets || []) {
        if (!unitIds.has(set.loadUnitId) || !unitIds.has(set.repsUnitId)) return { error: "Backup has a set that references a missing unit." };
      }
    }
  }
  return { data: candidate };
}

export async function replaceAllData(payload: ExportPayload) {
  await db.transaction("rw", db.units, db.exercises, db.days, db.workouts, db.settings, async () => {
    await Promise.all([db.units.clear(), db.exercises.clear(), db.days.clear(), db.workouts.clear(), db.settings.clear()]);
    await db.units.bulkPut(payload.units);
    await db.exercises.bulkPut(payload.exercises);
    await db.days.bulkPut(payload.days);
    await db.workouts.bulkPut(payload.workouts);
    await db.settings.put({ ...payload.settings, id: "settings" } as Settings);
  });
}

export async function exportDataFile() {
  const payload = await createExportPayload();
  const text = JSON.stringify(payload, null, 2);
  const fileName = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File([text], fileName, { type: "application/json" });
  const shareNavigator = navigator as Navigator & { canShare?: (data: ShareData) => boolean };

  const download = () => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  try {
    if (navigator.share && (!shareNavigator.canShare || shareNavigator.canShare({ files: [file] }))) {
      await navigator.share({ files: [file], title: "Workout backup" });
    } else {
      download();
    }
  } catch {
    download();
  }

  await saveSettings({ lastExportedAt: payload.exportedAt });
}

export function importCounts(payload: ExportPayload) {
  return `${payload.units.length} units, ${payload.exercises.length} exercises, ${payload.days.length} days, ${payload.workouts.length} workouts`;
}

export function backupReminder(data: AppData) {
  if (!data.settings.lastExportedAt) return "No backup exported yet. Export from Settings to protect this device-only data.";
  const days = Math.floor((Date.now() - Date.parse(data.settings.lastExportedAt)) / 86400000);
  return days >= 30 ? `Last backup was ${days} days ago. Export a fresh backup from Settings.` : "";
}
