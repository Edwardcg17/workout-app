import { useState } from "react";
import { exportDataFile, importCounts, replaceAllData, validateImportPayload } from "../data/exportImport";
import { saveSettings } from "../data/repository";
import type { AppData, ExportPayload } from "../types";

export function SettingsScreen({ data, onRefresh, toast }: { data: AppData; onRefresh: () => void; toast: (message: string) => void }) {
  const loadUnits = data.units.filter((unit) => unit.kind === "load" && !unit.archived);
  const [pendingImport, setPendingImport] = useState<ExportPayload | null>(null);
  const [importMessage, setImportMessage] = useState("");

  async function exportData() {
    try {
      await exportDataFile();
      toast("Backup exported.");
      onRefresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Export failed.");
    }
  }

  async function readImport(file: File) {
    try {
      const payload = JSON.parse(await file.text());
      const result = validateImportPayload(payload);
      if (result.error || !result.data) {
        setImportMessage(result.error || "Invalid backup file.");
        setPendingImport(null);
        return;
      }
      setPendingImport(result.data);
      setImportMessage(`Ready to import: ${importCounts(result.data)}. This will replace all current data.`);
    } catch {
      setImportMessage("Could not read that backup file.");
      setPendingImport(null);
    }
  }

  return (
    <section className="settings stack">
      <section className="card">
        <h3>Defaults</h3>
        <label>Bodyweight unit
          <select value={data.settings.defaultWeightUnit} onChange={(event) => saveSettings({ defaultWeightUnit: event.target.value as "kg" | "lb" }).then(onRefresh)}>
            <option value="lb">lb</option>
            <option value="kg">kg</option>
          </select>
        </label>
        <label>Default load unit for new exercises
          <select value={data.settings.defaultLoadUnitId} onChange={(event) => saveSettings({ defaultLoadUnitId: event.target.value }).then(onRefresh)}>
            {loadUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
          </select>
        </label>
        <label>Week starts on
          <select value={data.settings.weekStartsOn} onChange={(event) => saveSettings({ weekStartsOn: Number(event.target.value) as 0 | 1 }).then(onRefresh)}>
            <option value={0}>Sunday</option>
            <option value={1}>Monday</option>
          </select>
        </label>
      </section>
      <section className="card">
        <h3>Backup</h3>
        <p className="helper">Data lives only on this device. Export is your backup for a lost, replaced, or reset phone.</p>
        <p className="helper">Last exported: {data.settings.lastExportedAt ? new Date(data.settings.lastExportedAt).toLocaleString() : "Never"}</p>
        <button type="button" onClick={exportData}>Export data</button>
        <label className="file-button">Import data
          <input type="file" accept="application/json,.json" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) readImport(file);
            event.currentTarget.value = "";
          }} />
        </label>
        {importMessage && <p className="backup-message">{importMessage}</p>}
        {pendingImport && <button className="danger" type="button" onClick={() => {
          if (confirm("Replace all current app data with this backup?")) {
            replaceAllData(pendingImport).then(() => { setPendingImport(null); toast("Backup imported."); onRefresh(); });
          }
        }}>Confirm replace all data</button>}
      </section>
    </section>
  );
}
