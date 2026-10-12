import { useState } from "react";
import { createExercise, updateExercise } from "../../data/repository";
import type { AppData, ExerciseDef } from "../../types";

export function ExerciseForm({ data, exercise, onDone }: { data: AppData; exercise?: ExerciseDef; onDone: () => void }) {
  const loadUnits = data.units.filter((unit) => unit.kind === "load" && !unit.archived);
  const repsUnits = data.units.filter((unit) => unit.kind === "reps" && !unit.archived);
  const [name, setName] = useState(exercise?.name || "");
  const [loadUnitId, setLoadUnitId] = useState(exercise?.defaultLoadUnitId || data.settings.defaultLoadUnitId);
  const [repsUnitId, setRepsUnitId] = useState(exercise?.defaultRepsUnitId || repsUnits[0]?.id || "");
  const [error, setError] = useState("");

  return (
    <form className="inline-form" onSubmit={async (event) => {
      event.preventDefault();
      try {
        if (exercise) await updateExercise(exercise, { name, defaultLoadUnitId: loadUnitId, defaultRepsUnitId: repsUnitId }, data);
        else await createExercise(name, loadUnitId, repsUnitId, data);
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save exercise.");
      }
    }}>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Exercise name" />
      <label>Load unit
        <select value={loadUnitId} onChange={(event) => setLoadUnitId(event.target.value)}>
          {loadUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
        </select>
      </label>
      <label>Reps/RIR unit
        <select value={repsUnitId} onChange={(event) => setRepsUnitId(event.target.value)}>
          {repsUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
        </select>
      </label>
      <p className="helper">The reps unit is used for both reps and RIR.</p>
      <button type="submit">{exercise ? "Save" : "Add exercise"}</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
