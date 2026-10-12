import { useState } from "react";
import { createUnit } from "../data/repository";
import type { AppData, Unit } from "../types";
import { Modal } from "./Modal";

export function UnitPicker({
  data,
  kind,
  currentId,
  onSelect,
  onClose,
  onCreated
}: {
  data: AppData;
  kind: Unit["kind"];
  currentId: string;
  onSelect: (unitId: string) => void;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const units = data.units.filter((unit) => unit.kind === kind && (!unit.archived || unit.id === currentId));
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function create() {
    try {
      const unit = await createUnit(name, kind, data);
      onCreated?.();
      onSelect(unit.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create unit.");
    }
  }

  return (
    <Modal title={kind === "load" ? "Load unit" : "Reps / RIR unit"} onClose={onClose}>
      <div className="stack">
        {units.map((unit) => (
          <button key={unit.id} className={`list-button ${unit.id === currentId ? "is-selected" : ""}`} type="button" onClick={() => onSelect(unit.id)}>
            {unit.name}{unit.archived ? " (archived)" : ""}
          </button>
        ))}
        {!creating && <button type="button" onClick={() => setCreating(true)}>+ New unit</button>}
        {creating && (
          <form className="inline-form" onSubmit={(event) => { event.preventDefault(); create(); }}>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Unit name" autoFocus />
            <p className="helper">{kind === "load" ? "Used for the load field." : "Used for both reps and RIR. No conversion between units."}</p>
            <button type="submit">Create unit</button>
          </form>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </Modal>
  );
}
