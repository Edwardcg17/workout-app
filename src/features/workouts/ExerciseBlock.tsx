import { makeId } from "../../data/seed";
import { exerciseLabel } from "../../data/repository";
import type { AppData, SetEntry, Workout, WorkoutExercise } from "../../types";
import { SetRow } from "./SetRow";

export function ExerciseBlock({
  entry,
  workout,
  data,
  onChange,
  onRefresh
}: {
  entry: WorkoutExercise;
  workout: Workout;
  data: AppData;
  onChange: (workout: Workout) => void;
  onRefresh: () => void;
}) {
  const exercise = data.exercises.find((item) => item.id === entry.exerciseId);

  function updateEntry(next: WorkoutExercise) {
    onChange({ ...workout, exercises: workout.exercises.map((item) => item.id === entry.id ? next : item) });
  }

  function addSet() {
    const previous = entry.sets.at(-1);
    const nextSet: SetEntry = {
      id: makeId(),
      load: previous?.load,
      reps: previous?.reps,
      loadUnitId: previous?.loadUnitId || exercise?.defaultLoadUnitId || data.settings.defaultLoadUnitId,
      repsUnitId: previous?.repsUnitId || exercise?.defaultRepsUnitId || data.units.find((unit) => unit.kind === "reps")!.id,
      comments: []
    };
    updateEntry({ ...entry, sets: [...entry.sets, nextSet] });
  }

  return (
    <section className="exercise-block">
      <div className="section-head">
        <h4>{exerciseLabel(entry.exerciseId, data.exercises)}</h4>
        <button className="small danger" type="button" onClick={() => {
          if (confirm("Remove this exercise from the workout?")) onChange({ ...workout, exercises: workout.exercises.filter((item) => item.id !== entry.id) });
        }}>Remove</button>
      </div>
      {entry.sets.map((set, index) => (
        <SetRow
          key={set.id}
          set={set}
          index={index}
          data={data}
          onChange={(nextSet) => updateEntry({ ...entry, sets: entry.sets.map((item) => item.id === set.id ? nextSet : item) })}
          onDelete={() => {
            if (confirm("Delete this set?")) updateEntry({ ...entry, sets: entry.sets.filter((item) => item.id !== set.id) });
          }}
          onRefresh={onRefresh}
        />
      ))}
      <button className="secondary" type="button" onClick={addSet}>Add set</button>
    </section>
  );
}
