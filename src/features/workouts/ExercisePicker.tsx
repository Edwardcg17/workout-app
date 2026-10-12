import { useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import { findExerciseByName } from "../../data/repository";
import type { AppData, ExerciseDef } from "../../types";
import { ExerciseForm } from "../library/ExerciseForm";

export function ExercisePicker({
  data,
  onPick,
  onClose,
  onRefresh
}: {
  data: AppData;
  onPick: (exercise: ExerciseDef) => void;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const matches = useMemo(() => data.exercises.filter((exercise) => !exercise.archived && exercise.name.toLowerCase().includes(query.trim().toLowerCase())), [data.exercises, query]);
  const exact = findExerciseByName(query, data.exercises);

  return (
    <Modal title="Add exercise" onClose={onClose}>
      <div className="stack">
        <input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setCreating(false); }} placeholder="Search exercises" />
        {matches.map((exercise) => (
          <button key={exercise.id} className="list-button" type="button" onClick={() => onPick(exercise)}>{exercise.name}</button>
        ))}
        {query.trim() && !exact && !creating && (
          <button type="button" onClick={() => setCreating(true)}>Create "{query.trim()}"</button>
        )}
        {creating && (
          <ExerciseForm
            data={data}
            initialName={query.trim()}
            onDone={(exercise) => {
              onRefresh();
              if (exercise) onPick(exercise);
            }}
            onLibraryChange={onRefresh}
          />
        )}
        {matches.length === 0 && !query.trim() && <p className="empty">No exercises in the Library yet. Type a name to create one.</p>}
      </div>
    </Modal>
  );
}
