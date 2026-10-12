import { useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import { createExercise, findExerciseByName } from "../../data/repository";
import type { AppData, ExerciseDef } from "../../types";

export function ExercisePicker({ data, onPick, onClose }: { data: AppData; onPick: (exercise: ExerciseDef) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const loadUnitId = data.settings.defaultLoadUnitId;
  const repsUnitId = data.units.find((unit) => unit.kind === "reps" && unit.name === "reps")?.id || data.units.find((unit) => unit.kind === "reps")!.id;
  const matches = useMemo(() => data.exercises.filter((exercise) => !exercise.archived && exercise.name.toLowerCase().includes(query.trim().toLowerCase())), [data.exercises, query]);
  const exact = findExerciseByName(query, data.exercises);

  async function createAndPick() {
    try {
      const exercise = await createExercise(query, loadUnitId, repsUnitId, data);
      onPick(exercise);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create exercise.");
    }
  }

  return (
    <Modal title="Add exercise" onClose={onClose}>
      <div className="stack">
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercises" />
        {matches.map((exercise) => <button key={exercise.id} className="list-button" type="button" onClick={() => onPick(exercise)}>{exercise.name}</button>)}
        {query.trim() && !exact && <button type="button" onClick={createAndPick}>Create "{query.trim()}"</button>}
        {error && <p className="error">{error}</p>}
      </div>
    </Modal>
  );
}
