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
  const [creating, setCreating] = useState(false);

  const exercises = useMemo(() => data.exercises.filter((exercise) => (showArchived || !exercise.archived) && exercise.name.toLowerCase().includes(query.toLowerCase())), [data.exercises, query, showArchived]);
  const unitsByKind = (kind: Unit["kind"]) => data.units.filter((unit) => unit.kind === kind && (showArchived || !unit.archived));
  const extraUnitRefs = [
    ...data.exercises.flatMap((exercise) => [exercise.defaultLoadUnitId, exercise.defaultRepsUnitId]),
    data.settings.defaultLoadUnitId
  ];

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
    const used = exerciseUsage(exercise.id, data.workouts);
    return (
      <article className="list-card" key={exercise.id}>
        <div>
          <strong>{exercise.name}</strong>
          <p>{unitLabel(exercise.defaultLoadUnitId, data.units)} load, {unitLabel(exercise.defaultRepsUnitId, data.units)} reps/RIR. Used by {used} logged set{used === 1 ? "" : "s"}.</p>
        </div>
        <ExerciseForm data={data} exercise={exercise} onDone={onRefresh} onLibraryChange={onRefresh} />
        <div className="row-actions">
          <button className="small secondary" type="button" onClick={() => run(updateExercise(exercise, { archived: !exercise.archived }, data), exercise.archived ? "Exercise restored." : "Exercise archived.")}>{exercise.archived ? "Unarchive" : "Archive"}</button>
          {used === 0 && !exercise.archived && <button className="small danger" type="button" onClick={() => confirm("Delete this exercise? This cannot be undone.") && run(deleteOrArchiveExercise(exercise, data), "Exercise deleted.")}>Delete</button>}
        </div>
      </article>
    );
  }

  function unitCard(unit: Unit) {
    const used = unitUsage(unit.id, data.workouts, extraUnitRefs);
    return (
      <article className="list-card" key={unit.id}>
        <div>
          <strong>{unit.name}</strong>
          <p>{unit.kind === "load" ? "Load" : "Reps / RIR"} unit. Used by {used} logged set field{used === 1 ? "" : "s"}. {unit.builtIn ? "Built in." : ""}</p>
        </div>
        {!unit.builtIn && <UnitForm data={data} unit={unit} onDone={onRefresh} />}
        <div className="row-actions">
          {!unit.builtIn && <button className="small secondary" type="button" onClick={() => run(updateUnit(unit, { archived: !unit.archived }, data), unit.archived ? "Unit restored." : "Unit archived.")}>{unit.archived ? "Unarchive" : "Archive"}</button>}
          {!unit.builtIn && used === 0 && !unit.archived && <button className="small danger" type="button" onClick={() => confirm("Delete this unit? This cannot be undone.") && run(deleteOrArchiveUnit(unit, data), "Unit deleted.")}>Delete</button>}
        </div>
      </article>
    );
  }

  return (
    <section className="stack">
      <div className="segmented">
        <button className={mode === "exercises" ? "is-active" : ""} onClick={() => { setMode("exercises"); setCreating(false); }} type="button">Exercises</button>
        <button className={mode === "units" ? "is-active" : ""} onClick={() => { setMode("units"); setCreating(false); }} type="button">Units</button>
      </div>
      <label className="toggle"><input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} /> Show archived</label>
      {mode === "exercises" ? (
        <>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercises" />
          {!creating && <button type="button" onClick={() => setCreating(true)}>+ New exercise</button>}
          {creating && (
            <section className="card">
              <h3>New exercise</h3>
              <ExerciseForm data={data} onDone={() => { setCreating(false); onRefresh(); }} onLibraryChange={onRefresh} />
            </section>
          )}
          {exercises.map(exerciseCard)}
        </>
      ) : (
        <>
          {!creating && <button type="button" onClick={() => setCreating(true)}>+ New unit</button>}
          {creating && (
            <section className="card">
              <h3>New unit</h3>
              <UnitForm data={data} onDone={() => { setCreating(false); onRefresh(); }} />
            </section>
          )}
          <h3>Load units</h3>
          {unitsByKind("load").map(unitCard)}
          <h3>Reps / RIR units</h3>
          {unitsByKind("reps").map(unitCard)}
        </>
      )}
    </section>
  );
}
