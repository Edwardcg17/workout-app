import type { Unit } from "../types";

export function UnitChip({
  unit,
  units,
  onChange,
  label
}: {
  unit?: Unit;
  units: Unit[];
  onChange: (unitId: string) => void;
  label?: string;
}) {
  return (
    <label className="unit-chip">
      {label && <span>{label}</span>}
      <select value={unit?.id || ""} onChange={(event) => onChange(event.target.value)} aria-label={label || "Unit"}>
        {units.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
    </label>
  );
}
