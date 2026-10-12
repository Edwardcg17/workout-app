import { useEffect, useMemo, useRef, useState } from "react";
import { createWorkout, deleteWorkout, saveDayLog, saveWorkout } from "../data/repository";
import { formatLongDate } from "../utils/dates";
import type { AppData, DayLog, Workout } from "../types";
import { WorkoutCard } from "../features/workouts/WorkoutCard";
import { NumberField } from "../components/NumberField";

export function DayScreen({ date, data, onRefresh, toast }: { date: string; data: AppData; onRefresh: () => void; toast: (message: string) => void }) {
  const [log, setLog] = useState<DayLog>(() => data.days.find((day) => day.date === date) || { date, weightUnit: data.settings.defaultWeightUnit });
  const skipSave = useRef(true);
  const dayWorkouts = useMemo(() => data.workouts.filter((workout) => workout.date === date), [data.workouts, date]);

  useEffect(() => {
    skipSave.current = true;
    setLog(data.days.find((day) => day.date === date) || { date, weightUnit: data.settings.defaultWeightUnit });
  }, [date]);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      saveDayLog(log).then(onRefresh).catch((error) => toast(error.message));
    }, 400);
    return () => window.clearTimeout(handle);
  }, [log, onRefresh, toast]);

  function setMetric(name: keyof Pick<DayLog, "weight" | "calories" | "proteinG" | "carbsG" | "fatG">, value: number | undefined) {
    setLog((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="stack">
      <h2>{formatLongDate(date)}</h2>
      <section className="card">
        <h3>Body metrics</h3>
        <div className="metric-grid">
          <label>Weight
            <NumberField value={log.weight} onChange={(value) => setMetric("weight", value)} placeholder="0" />
          </label>
          <label>Unit
            <div className="segmented compact">
              {(["lb", "kg"] as const).map((unit) => (
                <button key={unit} className={(log.weightUnit || data.settings.defaultWeightUnit) === unit ? "is-active" : ""} type="button" onClick={() => setLog({ ...log, weightUnit: unit })}>{unit}</button>
              ))}
            </div>
          </label>
          <label>Calories
            <NumberField value={log.calories} inputMode="numeric" onChange={(value) => setMetric("calories", value)} placeholder="0" />
          </label>
          <label>Protein g
            <NumberField value={log.proteinG} inputMode="numeric" onChange={(value) => setMetric("proteinG", value)} placeholder="0" />
          </label>
          <label>Carbs g
            <NumberField value={log.carbsG} inputMode="numeric" onChange={(value) => setMetric("carbsG", value)} placeholder="0" />
          </label>
          <label>Fat g
            <NumberField value={log.fatG} inputMode="numeric" onChange={(value) => setMetric("fatG", value)} placeholder="0" />
          </label>
        </div>
      </section>
      <section className="stack">
        <div className="section-head">
          <h3>Workouts</h3>
          <button type="button" onClick={() => createWorkout(date).then(onRefresh)}>Add workout</button>
        </div>
        {dayWorkouts.length === 0 && <p className="empty">No workouts yet. Add one when you are ready.</p>}
        {dayWorkouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            dayWorkouts={dayWorkouts}
            data={data}
            onChange={(next: Workout) => saveWorkout(next).then(onRefresh)}
            onDelete={() => {
              if (confirm("Delete this workout?")) deleteWorkout(workout.id).then(() => { toast("Workout deleted."); onRefresh(); });
            }}
            onRefresh={onRefresh}
            toast={toast}
          />
        ))}
      </section>
    </section>
  );
}
