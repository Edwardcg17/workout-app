import { useState } from "react";
import type { AppData, Unit } from "../types";
import { UnitPicker } from "./UnitPicker";

export function UnitChip({
  data,
  kind,
  unit,
  onChange,
  label,
  onCreated
}: {
  data: AppData;
  kind: Unit["kind"];
  unit?: Unit;
  onChange: (unitId: string) => void;
  label?: string;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="unit-chip-button" type="button" onClick={() => setOpen(true)} aria-label={label || "Change unit"}>
        {label && <span className="chip-kicker">{label}</span>}
        <strong>{unit?.name || "Unit"}</strong>
      </button>
      {open && (
        <UnitPicker
          data={data}
          kind={kind}
          currentId={unit?.id || ""}
          onSelect={(id) => { onChange(id); setOpen(false); }}
          onClose={() => setOpen(false)}
          onCreated={onCreated}
        />
      )}
    </>
  );
}
