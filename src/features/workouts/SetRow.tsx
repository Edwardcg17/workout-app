import { useState } from "react";
import { CommentList } from "../../components/CommentList";
import { UnitChip } from "../../components/UnitChip";
import { parseOptionalNumber, numberInputValue } from "../../utils/numbers";
import { formatRir, parseRirInput } from "../../utils/rir";
import type { AppData, SetEntry } from "../../types";

export function SetRow({ set, index, data, onChange, onDelete }: { set: SetEntry; index: number; data: AppData; onChange: (set: SetEntry) => void; onDelete: () => void }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const loadUnits = data.units.filter((unit) => unit.kind === "load" && !unit.archived);
  const repsUnits = data.units.filter((unit) => unit.kind === "reps" && !unit.archived);
  const repsUnit = data.units.find((unit) => unit.id === set.repsUnitId);
  const [rirText, setRirText] = useState(formatRir(set.rir));
  const rirResult = parseRirInput(rirText, repsUnit);

  return (
    <div className="set-row-card">
      <div className="set-line">
        <strong>Set {index + 1}</strong>
        <input inputMode="decimal" placeholder="Load" value={numberInputValue(set.load)} onChange={(event) => {
          const value = parseOptionalNumber(event.target.value);
          if (!Number.isNaN(value)) onChange({ ...set, load: value });
        }} />
        <UnitChip unit={data.units.find((unit) => unit.id === set.loadUnitId)} units={loadUnits} onChange={(loadUnitId) => onChange({ ...set, loadUnitId })} />
        <button className="small danger" type="button" onClick={() => confirm("Delete this set?") && onDelete()}>Delete</button>
      </div>
      <div className="set-line">
        <input inputMode="decimal" placeholder="Reps" value={numberInputValue(set.reps)} onChange={(event) => {
          const value = parseOptionalNumber(event.target.value);
          if (!Number.isNaN(value)) onChange({ ...set, reps: value });
        }} />
        <input className={rirResult.error ? "invalid" : ""} placeholder="RIR 1-2" value={rirText} onChange={(event) => {
          const nextText = event.target.value;
          setRirText(nextText);
          const parsed = parseRirInput(nextText, repsUnit);
          if (!parsed.error) onChange({ ...set, rir: parsed.value });
        }} />
        <UnitChip label="reps/RIR" unit={repsUnit} units={repsUnits} onChange={(repsUnitId) => onChange({ ...set, repsUnitId })} />
        <button className="small" type="button" onClick={() => setCommentsOpen(!commentsOpen)}>Comments {set.comments.length}</button>
      </div>
      {rirResult.error && <p className="error">{rirResult.error}</p>}
      {commentsOpen && <CommentList comments={set.comments} onChange={(comments) => onChange({ ...set, comments })} />}
    </div>
  );
}
