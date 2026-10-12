import { useEffect, useState } from "react";
import { numberInputValue, parseOptionalNumber } from "../utils/numbers";

function textMatchesValue(text: string, value?: number) {
  const trimmed = text.trim();
  if (!trimmed || trimmed === ".") return value === undefined;
  const parsed = parseOptionalNumber(trimmed);
  return !Number.isNaN(parsed) && parsed === value;
}

export function NumberField({
  value,
  onChange,
  inputMode = "decimal",
  placeholder,
  ariaLabel
}: {
  value?: number;
  onChange: (value: number | undefined, error?: string) => void;
  inputMode?: "decimal" | "numeric";
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [text, setText] = useState(numberInputValue(value));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!textMatchesValue(text, value)) setText(numberInputValue(value));
  }, [value]);

  return (
    <div className="field">
      <input
        inputMode={inputMode}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className={error ? "invalid" : ""}
        value={text}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          const parsed = parseOptionalNumber(next);
          if (Number.isNaN(parsed)) {
            setError("Enter 0 or a positive number.");
            onChange(value, "Enter 0 or a positive number.");
            return;
          }
          setError("");
          onChange(parsed);
        }}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
