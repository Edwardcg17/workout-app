import { useState } from "react";
import type { AppData, Unit } from "../../types";
import { createUnit, updateUnit } from "../../data/repository";

export function UnitForm({ data, unit, fixedKind, onDone }: { data: AppData; unit?: Unit; fixedKind?: Unit["kind"]; onDone: () => void }) {
  const [name, setName] = useState(unit?.name || "");
  const [kind, setKind] = useState<Unit["kind"]>(unit?.kind || fixedKind || "load");
  const [error, setError] = useState("");

  return (
    <form className="inline-form" onSubmit={async (event) => {
      event.preventDefault();
      try {
        if (unit) await updateUnit(unit, { name }, data);
        else await createUnit(name, kind, data);
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save unit.");
      }
    }}>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Unit name" disabled={unit?.builtIn} />
      {!unit && !fixedKind && <select value={kind} onChange={(event) => setKind(event.target.value as Unit["kind"])}><option value="load">Load</option><option value="reps">Reps / RIR</option></select>}
      <button type="submit">{unit ? "Save" : "Add unit"}</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
