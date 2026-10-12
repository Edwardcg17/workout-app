export function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === ".") return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
}

export function numberInputValue(value?: number) {
  return value === undefined ? "" : String(value);
}

export function compactNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}
