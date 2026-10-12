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
  const selectedExercise = data.exercises.find((exercise) => exercise.id === selection);
  const loadUnitIds = selectedExercise ? exerciseUnitIds(data, selectedExercise.id, range, "load") : [];
  const repsUnitIds = selectedExercise ? exerciseUnitIds(data, selectedExercise.id, range, "reps") : [];
  const metric = loadUnitIds.length > 0 ? "load" : "reps";
  const unitIds = metric === "load" ? loadUnitIds : repsUnitIds;
  const [chosenUnitId, setChosenUnitId] = useState("");
  const unitId = chosenUnitId && unitIds.includes(chosenUnitId) ? chosenUnitId : unitIds[0] || selectedExercise?.defaultLoadUnitId || "";
  const points = selection === "bodyweight" ? bodyweightPoints(data, range) : selectedExercise && unitId ? exercisePoints(data, selectedExercise.id, range, unitId, metric) : [];
  const yLabel = selection === "bodyweight" ? `Bodyweight (${data.settings.defaultWeightUnit})` : `${metric === "load" ? "Load" : "Reps"} (${unitLabel(unitId, data.units)})`;

  function persist(nextSelection = selection, nextRange = range) {
    saveSettings({ lastGraphSelection: nextSelection, graphRange: nextRange }).then(onRefresh);
  }

  return (
    <section className="stack">
      <select value={selection} onChange={(event) => { setSelection(event.target.value); setChosenUnitId(""); persist(event.target.value, range); }}>
        <option value="bodyweight">Bodyweight</option>
        {exercisesWithData.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
      </select>
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
