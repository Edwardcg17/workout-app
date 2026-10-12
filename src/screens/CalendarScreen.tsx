import { useMemo, useState } from "react";
import { addMonths, monthKey, parseLocalDate, toLocalDateString } from "../utils/dates";
import { backupReminder } from "../data/exportImport";
import type { AppData } from "../types";

export function CalendarScreen({ data, onOpenDay }: { data: AppData; onOpenDay: (date: string) => void }) {
  const today = toLocalDateString();
  const [month, setMonth] = useState(new Date());
  const workoutDates = useMemo(() => new Map(data.workouts.map((workout) => [workout.date, true])), [data.workouts]);
  const dayDates = useMemo(() => new Map(data.days.filter((day) => day.weight !== undefined || day.calories !== undefined || day.proteinG !== undefined || day.carbsG !== undefined || day.fatG !== undefined).map((day) => [day.date, true])), [data.days]);
  const reminder = backupReminder(data);
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const startOffset = (first.getDay() - data.settings.weekStartsOn + 7) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - startOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [month, data.settings.weekStartsOn]);

  return (
    <section>
      {reminder && <div className="backup-banner">{reminder}</div>}
      <div className="month-controls">
        <button className="secondary" type="button" onClick={() => setMonth(addMonths(month, -1))}>Prev</button>
        <strong>{new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(month)}</strong>
        <button className="secondary" type="button" onClick={() => setMonth(addMonths(month, 1))}>Next</button>
      </div>
      <button className="ghost full" type="button" onClick={() => setMonth(parseLocalDate(today))}>Today</button>
      <div className="weekday-row">
        {(data.settings.weekStartsOn === 1 ? ["M", "T", "W", "T", "F", "S", "S"] : ["S", "M", "T", "W", "T", "F", "S"]).map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        {cells.map((date) => {
          const key = toLocalDateString(date);
          const muted = monthKey(date) !== monthKey(month);
          return (
            <button key={key} className={`day-cell ${muted ? "is-muted" : ""} ${key === today ? "is-today" : ""}`} onClick={() => onOpenDay(key)} type="button">
              <span>{date.getDate()}</span>
              <span className="markers">
                {workoutDates.has(key) && <i className="workout-dot" />}
                {dayDates.has(key) && <i className="body-dot" />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
