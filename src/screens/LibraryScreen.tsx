import { useMemo, useState } from "react";
import { deleteOrArchiveExercise, deleteOrArchiveUnit, updateExercise, updateUnit, unitLabel } from "../data/repository";
import { exerciseUsage, unitUsage } from "../data/validation";
import type { AppData, ExerciseDef, Unit } from "../types";
import { ExerciseForm } from "../features/library/ExerciseForm";
import { UnitForm } from "../features/library/UnitForm";

export function LibraryScreen({ data, onRefresh, toast }: { data: AppData; onRefresh: () => void; toast: (message: string) => void }) {
  const [mode, setMode] = useState<"exercises" | "units">("exercises");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const exercises = useMemo(() => data.exercises.filter((exercise) => (showArchived || !exercise.archived) && exercise.name.toLowerCase().includes(query.toLowerCase())), [data.exercises, query, showArchived]);
  const unitsByKind = (kind: Unit["kind"]) => data.units.filter((unit) => unit.kind === kind && (showArchived || !unit.archived));

  async function run(action: Promise<unknown>, message: string) {
    try {
      await action;
      toast(message);
      onRefresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not update library.");
    }
  }

  function exerciseCard(exercise: ExerciseDef) {
    return (
      <article className="list-card" key={exercise.id}>
        <div>
          <strong>{exercise.name}</strong>
          <p>{unitLabel(exercise.defaultLoadUnitId, data.units)} load, {unitLabel(exercise.defaultRepsUnitId, data.units)} reps/RIR. Used by {exerciseUsage(exercise.id, data.workouts)} logged sets.</p>
        </div>
        <ExerciseForm data={data} exercise={exercise} onDone={onRefresh} />
        <div className="row-actions">
          <button className="small secondary" type="button" onClick={() => run(updateExercise(exercise, { archived: !exercise.archived }, data), exercise.archived ? "Exercise restored." : "Exercise archived.")}>{exercise.archived ? "Unarchive" : "Archive"}</button>
          <button className="small danger" type="button" onClick={() => confirm("Delete or archive this exercise?") && run(deleteOrArchiveExercise(exercise, data), "Exercise updated.")}>Delete</button>
        </div>
      </article>
    );
  }

  function unitCard(unit: Unit) {
    return (
      <article className="list-card" key={unit.id}>
        <div>
          <strong>{unit.name}</strong>
          <p>{unit.kind === "load" ? "Load" : "Reps / RIR"} unit. Used by {unitUsage(unit.id, data.workouts)} logged set fields. {unit.builtIn ? "Built in." : ""}</p>
        </div>
        {!unit.builtIn && <UnitForm data={data} unit={unit} onDone={onRefresh} />}
        <div className="row-actions">
          {!unit.builtIn && <button className="small secondary" type="button" onClick={() => run(updateUnit(unit, { archived: !unit.archived }, data), unit.archived ? "Unit restored." : "Unit archived.")}>{unit.archived ? "Unarchive" : "Archive"}</button>}
          {!unit.builtIn && <button className="small danger" type="button" onClick={() => confirm("Delete or archive this unit?") && run(deleteOrArchiveUnit(unit, data), "Unit updated.")}>Delete</button>}
        </div>
      </article>
    );
  }

  return (
    <section className="stack">
      <div className="segmented">
        <button className={mode === "exercises" ? "is-active" : ""} onClick={() => setMode("exercises")} type="button">Exercises</button>
        <button className={mode === "units" ? "is-active" : ""} onClick={() => setMode("units")} type="button">Units</button>
      </div>
      <label className="toggle"><input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} /> Show archived</label>
      {mode === "exercises" ? (
        <>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercises" />
          <section className="card"><h3>New exercise</h3><ExerciseForm data={data} onDone={onRefresh} /></section>
          {exercises.map(exerciseCard)}
        </>
      ) : (
        <>
          <section className="card"><h3>New unit</h3><UnitForm data={data} onDone={onRefresh} /></section>
          <h3>Load units</h3>
          {unitsByKind("load").map(unitCard)}
          <h3>Reps / RIR units</h3>
          {unitsByKind("reps").map(unitCard)}
        </>
      )}
    </section>
  );
}
