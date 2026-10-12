export function toLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatLongDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(parseLocalDate(value));
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function daysBetween(start: string, end: string) {
  return Math.round((parseLocalDate(end).getTime() - parseLocalDate(start).getTime()) / 86400000);
}

export function startDateForRange(range: string, today = new Date()) {
  if (range === "All") return undefined;
  const months = range === "1M" ? 1 : range === "3M" ? 3 : range === "6M" ? 6 : 12;
  const date = new Date(today.getFullYear(), today.getMonth() - months, today.getDate());
  return toLocalDateString(date);
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(parseLocalDate(value));
}
