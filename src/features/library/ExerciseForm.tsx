import { useState } from "react";
import { createExercise, updateExercise } from "../../data/repository";
import type { AppData, ExerciseDef } from "../../types";
import { UnitChip } from "../../components/UnitChip";

export function ExerciseForm({
  data,
  exercise,
  initialName,
  onDone,
  onLibraryChange
}: {
  data: AppData;
  exercise?: ExerciseDef;
  initialName?: string;
  onDone: (created?: ExerciseDef) => void;
  onLibraryChange?: () => void;
}) {
  const loadUnits = data.units.filter((unit) => unit.kind === "load" && !unit.archived);
  const repsUnits = data.units.filter((unit) => unit.kind === "reps" && !unit.archived);
  const [name, setName] = useState(exercise?.name || initialName || "");
  const [loadUnitId, setLoadUnitId] = useState(exercise?.defaultLoadUnitId || data.settings.defaultLoadUnitId);
  const [repsUnitId, setRepsUnitId] = useState(exercise?.defaultRepsUnitId || repsUnits[0]?.id || "");
  const [error, setError] = useState("");

  return (
    <form className="inline-form" onSubmit={async (event) => {
      event.preventDefault();
      try {
        if (exercise) {
          await updateExercise(exercise, { name, defaultLoadUnitId: loadUnitId, defaultRepsUnitId: repsUnitId }, data);
          onDone();
        } else {
          const created = await createExercise(name, loadUnitId, repsUnitId, data);
          onDone(created);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save exercise.");
      }
    }}>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Exercise name" />
      <label>Default load unit
        <UnitChip data={data} kind="load" unit={loadUnits.find((unit) => unit.id === loadUnitId) || data.units.find((unit) => unit.id === loadUnitId)} onChange={setLoadUnitId} onCreated={onLibraryChange} />
      </label>
      <label>Default reps / RIR unit
        <UnitChip data={data} kind="reps" unit={repsUnits.find((unit) => unit.id === repsUnitId) || data.units.find((unit) => unit.id === repsUnitId)} onChange={setRepsUnitId} onCreated={onLibraryChange} />
      </label>
      <p className="helper">The reps unit is used for both reps and RIR on every set of this exercise. Changing these defaults does not rewrite logged sets.</p>
      <button type="submit">{exercise ? "Save" : "Add exercise"}</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
