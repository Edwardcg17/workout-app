import { useState } from "react";
import { CommentList } from "../../components/CommentList";
import { addExerciseToWorkout, duplicateWorkout, workoutDisplayName } from "../../data/repository";
import { toLocalDateString } from "../../utils/dates";
import type { AppData, Workout } from "../../types";
import { ExerciseBlock } from "./ExerciseBlock";
import { ExercisePicker } from "./ExercisePicker";
import { Modal } from "../../components/Modal";

export function WorkoutCard({
  workout,
  dayWorkouts,
  data,
  onChange,
  onDelete,
  onRefresh,
  toast
}: {
  workout: Workout;
  dayWorkouts: Workout[];
  data: AppData;
  onChange: (workout: Workout) => void;
  onDelete: () => void;
  onRefresh: () => void;
  toast: (message: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [copyDate, setCopyDate] = useState(toLocalDateString());

  return (
    <article className="card workout-card">
      <div className="section-head">
        <h3>{workoutDisplayName(workout, dayWorkouts)}</h3>
        <button className="small danger" type="button" onClick={onDelete}>Delete</button>
      </div>
      <label>Workout name
        <input value={workout.name || ""} onChange={(event) => onChange({ ...workout, name: event.target.value })} placeholder="Optional" />
      </label>
      <div className="stack compact">
        {workout.exercises.map((entry) => (
          <ExerciseBlock
            key={entry.id}
            entry={entry}
            workout={workout}
            data={data}
            onChange={onChange}
            onRefresh={onRefresh}
          />
        ))}
        <button className="secondary" type="button" onClick={() => setPicking(true)}>Add exercise</button>
      </div>
      <details>
        <summary>Workout comments ({workout.comments.length})</summary>
        <CommentList comments={workout.comments} onChange={(comments) => onChange({ ...workout, comments })} />
      </details>
      <button className="ghost" type="button" onClick={() => setDuplicating(true)}>Duplicate to another date</button>
      {picking && (
        <ExercisePicker
          data={data}
          onClose={() => setPicking(false)}
          onPick={(exercise) => { onChange(addExerciseToWorkout(workout, exercise)); setPicking(false); }}
          onRefresh={onRefresh}
        />
      )}
      {duplicating && (
        <Modal title="Duplicate workout" onClose={() => setDuplicating(false)}>
          <form className="inline-form" onSubmit={(event) => {
            event.preventDefault();
            duplicateWorkout(workout, copyDate).then(() => {
              toast(`Copied to ${copyDate}.`);
              setDuplicating(false);
              onRefresh();
            });
          }}>
            <label>Date
              <input type="date" value={copyDate} onChange={(event) => setCopyDate(event.target.value)} required />
            </label>
            <button type="submit">Duplicate</button>
          </form>
        </Modal>
      )}
    </article>
  );
}
