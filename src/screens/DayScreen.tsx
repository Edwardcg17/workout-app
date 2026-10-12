import { useEffect, useMemo, useState } from "react";
import { createWorkout, deleteWorkout, saveDayLog, saveWorkout, workoutDisplayName } from "../data/repository";
import { formatLongDate } from "../utils/dates";
import { numberInputValue, parseOptionalNumber } from "../utils/numbers";
import type { AppData, DayLog, Workout } from "../types";
import { WorkoutCard } from "../features/workouts/WorkoutCard";

export function DayScreen({ date, data, onBack, onRefresh, toast }: { date: string; data: AppData; onBack: () => void; onRefresh: () => void; toast: (message: string) => void }) {
  const existing = data.days.find((day) => day.date === date);
  const [log, setLog] = useState<DayLog>(existing || { date, weightUnit: data.settings.defaultWeightUnit });
  const dayWorkouts = useMemo(() => data.workouts.filter((workout) => workout.date === date), [data.workouts, date]);

  useEffect(() => {
    setLog(existing || { date, weightUnit: data.settings.defaultWeightUnit });
  }, [date, existing, data.settings.defaultWeightUnit]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      saveDayLog(log).then(onRefresh).catch((error) => toast(error.message));
    }, 400);
    return () => window.clearTimeout(handle);
  }, [log, onRefresh, toast]);

  function field(name: keyof DayLog, mode: "decimal" | "numeric" = "decimal") {
    return (
      <input
        inputMode={mode}
        value={numberInputValue(log[name] as number | undefined)}
        onChange={(event) => {
          const value = parseOptionalNumber(event.target.value);
          setLog((current) => ({ ...current, [name]: Number.isNaN(value) ? current[name] : value }));
        }}
      />
    );
  }

  return (
    <section className="stack">
      <button className="ghost back-button" onClick={onBack} type="button">Back</button>
      <h2>{formatLongDate(date)}</h2>
      <section className="card">
        <h3>Body metrics</h3>
        <div className="metric-grid">
          <label>Weight {field("weight")} </label>
          <label>Unit <select value={log.weightUnit || data.settings.defaultWeightUnit} onChange={(event) => setLog({ ...log, weightUnit: event.target.value as "kg" | "lb" })}><option value="lb">lb</option><option value="kg">kg</option></select></label>
          <label>Calories {field("calories", "numeric")}</label>
          <label>Protein g {field("proteinG", "numeric")}</label>
          <label>Carbs g {field("carbsG", "numeric")}</label>
          <label>Fat g {field("fatG", "numeric")}</label>
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
            title={workoutDisplayName(workout, dayWorkouts)}
            workout={workout}
            data={data}
            onChange={(next) => saveWorkout(next).then(onRefresh)}
            onDelete={() => {
              if (confirm("Delete this workout?")) deleteWorkout(workout.id).then(() => { toast("Workout deleted."); onRefresh(); });
            }}
          />
        ))}
      </section>
    </section>
  );
}
