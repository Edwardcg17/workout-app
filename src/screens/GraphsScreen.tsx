import { useMemo, useState } from "react";
import { saveSettings, unitLabel } from "../data/repository";
import type { AppData, GraphRange } from "../types";
import { bodyweightPoints, exercisePoints, exerciseUnitIds } from "../utils/graph";
import { TimeSeriesChart } from "../features/graphs/TimeSeriesChart";

const ranges: GraphRange[] = ["1M", "3M", "6M", "1Y", "All"];

export function GraphsScreen({ data, onRefresh }: { data: AppData; onRefresh: () => void }) {
  const exercisesWithData = useMemo(() => data.exercises.filter((exercise) => data.workouts.some((workout) => workout.exercises.some((entry) => entry.exerciseId === exercise.id && entry.sets.length > 0))), [data.exercises, data.workouts]);
  const [selection, setSelection] = useState(data.settings.lastGraphSelection || "bodyweight");
  const [range, setRange] = useState<GraphRange>(data.settings.graphRange || "3M");
  const [search, setSearch] = useState("");
  const filtered = exercisesWithData.filter((exercise) => exercise.name.toLowerCase().includes(search.trim().toLowerCase()));
  const selectedExercise = data.exercises.find((exercise) => exercise.id === selection);
  const loadUnitIds = selectedExercise ? exerciseUnitIds(data, selectedExercise.id, range, "load") : [];
  const repsUnitIds = selectedExercise ? exerciseUnitIds(data, selectedExercise.id, range, "reps") : [];
  const metric = loadUnitIds.length > 0 ? "load" : "reps";
  const unitIds = metric === "load" ? loadUnitIds : repsUnitIds;
  const [chosenUnitId, setChosenUnitId] = useState("");
  const preferred = selectedExercise ? (metric === "load" ? selectedExercise.defaultLoadUnitId : selectedExercise.defaultRepsUnitId) : "";
  const unitId = chosenUnitId && unitIds.includes(chosenUnitId) ? chosenUnitId : unitIds.includes(preferred) ? preferred : unitIds[0] || "";
  const points = selection === "bodyweight" ? bodyweightPoints(data, range) : selectedExercise && unitId ? exercisePoints(data, selectedExercise.id, range, unitId, metric) : [];
  const yLabel = selection === "bodyweight" ? `Bodyweight (${data.settings.defaultWeightUnit})` : `${metric === "load" ? "Load" : "Reps"} (${unitLabel(unitId, data.units)})`;

  function persist(nextSelection = selection, nextRange = range) {
    saveSettings({ lastGraphSelection: nextSelection, graphRange: nextRange }).then(onRefresh);
  }

  return (
    <section className="stack">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search exercises" />
      <div className="choice-list">
        <button className={`list-button ${selection === "bodyweight" ? "is-selected" : ""}`} type="button" onClick={() => { setSelection("bodyweight"); setChosenUnitId(""); persist("bodyweight", range); }}>Bodyweight</button>
        {filtered.map((exercise) => (
          <button key={exercise.id} className={`list-button ${selection === exercise.id ? "is-selected" : ""}`} type="button" onClick={() => { setSelection(exercise.id); setChosenUnitId(""); persist(exercise.id, range); }}>{exercise.name}</button>
        ))}
      </div>
      <div className="chip-row">
        {ranges.map((item) => <button key={item} className={range === item ? "chip is-active" : "chip"} type="button" onClick={() => { setRange(item); persist(selection, item); }}>{item}</button>)}
      </div>
      {selection !== "bodyweight" && unitIds.length > 1 && (
        <div className="chip-row">
          {unitIds.map((id) => <button key={id} className={unitId === id ? "chip is-active" : "chip"} type="button" onClick={() => setChosenUnitId(id)}>{unitLabel(id, data.units)}</button>)}
        </div>
      )}
      <TimeSeriesChart points={points} yLabel={yLabel} />
    </section>
  );
}
