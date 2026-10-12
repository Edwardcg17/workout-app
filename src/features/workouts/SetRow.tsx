import { useEffect, useState } from "react";
import { CommentList } from "../../components/CommentList";
import { NumberField } from "../../components/NumberField";
import { UnitChip } from "../../components/UnitChip";
import { formatRir, parseRirInput } from "../../utils/rir";
import type { AppData, SetEntry } from "../../types";

export function SetRow({
  set,
  index,
  data,
  onChange,
  onDelete,
  onRefresh
}: {
  set: SetEntry;
  index: number;
  data: AppData;
  onChange: (set: SetEntry) => void;
  onDelete: () => void;
  onRefresh: () => void;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const repsUnit = data.units.find((unit) => unit.id === set.repsUnitId);
  const loadUnit = data.units.find((unit) => unit.id === set.loadUnitId);
  const [rirText, setRirText] = useState(formatRir(set.rir));
  const rirResult = parseRirInput(rirText, repsUnit);

  useEffect(() => {
    setRirText(formatRir(set.rir));
  }, [set.id]);

  return (
    <div className="set-row-card">
      <div className="set-line">
        <strong className="set-number">{index + 1}</strong>
        <NumberField value={set.load} placeholder="Load" onChange={(load) => onChange({ ...set, load })} />
        <UnitChip data={data} kind="load" unit={loadUnit} onChange={(loadUnitId) => onChange({ ...set, loadUnitId })} onCreated={onRefresh} />
        <button className="icon-x" type="button" onClick={onDelete} aria-label="Delete set">×</button>
      </div>
      <div className="set-line">
        <NumberField value={set.reps} placeholder="Reps" onChange={(reps) => onChange({ ...set, reps })} />
        <div className="rir-field">
          <input
            className={rirResult.error ? "invalid" : ""}
            placeholder="RIR 1-2"
            aria-label="RIR"
            value={rirText}
            onChange={(event) => {
              const nextText = event.target.value.replace("–", "-");
              setRirText(nextText);
              const parsed = parseRirInput(nextText, repsUnit);
              if (!parsed.error) onChange({ ...set, rir: parsed.value });
            }}
          />
          <button className="ghost tiny" type="button" onClick={() => {
            const next = rirText.includes("-") ? rirText : `${rirText || "0"}-`;
            setRirText(next);
          }} aria-label="Insert range dash">–</button>
        </div>
        <UnitChip label="reps + RIR" data={data} kind="reps" unit={repsUnit} onChange={(repsUnitId) => onChange({ ...set, repsUnitId })} onCreated={onRefresh} />
        <button className="ghost tiny badge-button" type="button" onClick={() => setCommentsOpen(!commentsOpen)} aria-label="Set comments">
          Notes{set.comments.length > 0 && <span className="count-badge">{set.comments.length}</span>}
        </button>
      </div>
      {rirResult.error && <p className="error">{rirResult.error}</p>}
      {commentsOpen && <CommentList comments={set.comments} onChange={(comments) => onChange({ ...set, comments })} />}
    </div>
  );
}
