import type { RangeValue, Unit } from "../types";
import { compactNumber } from "./numbers";

export function parseRirInput(value: string, unit?: Unit): { value?: RangeValue; error?: string } {
  const trimmed = value.trim().replace("–", "-");
  if (!trimmed) return {};
  const parts = trimmed.split("-").map((part) => part.trim()).filter(Boolean);
  if (parts.length > 2) return { error: "Use a number or range like 1-2." };
  const nums = parts.map(Number);
  if (nums.some((num) => !Number.isFinite(num) || num < 0)) return { error: "RIR must be 0 or higher." };
  if (parts.length === 2 && nums[0] > nums[1]) return { error: "Range minimum must be <= maximum." };
  if (unit?.name === "reps" && nums.some((num) => num > 10)) return { error: "RIR in reps must be between 0 and 10." };
  return { value: parts.length === 1 ? { min: nums[0] } : { min: nums[0], max: nums[1] } };
}

export function formatRir(value?: RangeValue) {
  if (!value) return "";
  return value.max === undefined ? compactNumber(value.min) : `${compactNumber(value.min)}-${compactNumber(value.max)}`;
}
