import { useState } from "react";
import type { ChartPoint } from "../../utils/graph";
import { pointX } from "../../utils/graph";
import { formatShortDate } from "../../utils/dates";

export function TimeSeriesChart({ points, yLabel }: { points: ChartPoint[]; yLabel: string }) {
  const [selected, setSelected] = useState<ChartPoint | undefined>(points.at(-1));
  if (points.length === 0) return <p className="empty">No data for this series yet.</p>;
  const minDate = points[0].date;
  const maxDate = points[points.length - 1].date;
  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));
  const width = 320;
  const height = 210;
  const pad = 30;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;
  const valueRange = Math.max(1, max - min);

  function y(value: number) {
    return pad + plotH - ((value - min) / valueRange) * plotH;
  }

  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${pad + pointX(point.date, minDate, maxDate, plotW)} ${y(point.value)}`).join(" ");

  return (
    <div className="chart-wrap">
      <p className="chart-label">{yLabel}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart" role="img" aria-label={yLabel}>
        <line x1={pad} x2={pad} y1={pad} y2={height - pad} />
        <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} />
        <path d={path} fill="none" />
        {points.map((point) => {
          const cx = pad + pointX(point.date, minDate, maxDate, plotW);
          const cy = y(point.value);
          const isSelected = selected?.id === point.id;
          return <circle key={point.id} cx={cx} cy={cy} r={isSelected ? 7 : 5} onClick={() => setSelected(point)} />;
        })}
      </svg>
      <div className="axis-row"><span>{formatShortDate(minDate)}</span><span>{formatShortDate(maxDate)}</span></div>
      {selected && <div className="tooltip-card"><strong>{formatShortDate(selected.date)}</strong><span>{selected.label}</span>{selected.detail && <small>{selected.detail}</small>}</div>}
    </div>
  );
}
