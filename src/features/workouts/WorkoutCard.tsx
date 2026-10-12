import { useState } from "react";
import { CommentList } from "../../components/CommentList";
import { addExerciseToWorkout } from "../../data/repository";
import type { AppData, Workout } from "../../types";
import { ExerciseBlock } from "./ExerciseBlock";
import { ExercisePicker } from "./ExercisePicker";

export function WorkoutCard({ title, workout, data, onChange, onDelete }: { title: string; workout: Workout; data: AppData; onChange: (workout: Workout) => void; onDelete: () => void }) {
  const [picking, setPicking] = useState(false);

  return (
    <article className="card workout-card">
      <div className="section-head">
        <h3>{title}</h3>
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
          />
        ))}
        <button className="secondary" type="button" onClick={() => setPicking(true)}>Add exercise</button>
      </div>
      <details>
        <summary>Workout comments ({workout.comments.length})</summary>
        <CommentList comments={workout.comments} onChange={(comments) => onChange({ ...workout, comments })} />
      </details>
      {picking && <ExercisePicker data={data} onClose={() => setPicking(false)} onPick={(exercise) => { onChange(addExerciseToWorkout(workout, exercise)); setPicking(false); }} />}
    </article>
  );
}
