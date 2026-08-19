import {
  MAX_DRAW_NUMBER,
  MIN_DRAW_NUMBER,
} from "@/shared/draw-pool/draw-pool.constant";

export function getRangeError(
  minValue: string,
  maxValue: string
): string | null {
  if (minValue.trim() === "" || maxValue.trim() === "") {
    return "Enter both minimum and maximum numbers.";
  }

  const min = Number(minValue);
  const max = Number(maxValue);

  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    return "Range values must be whole numbers.";
  }

  if (min < MIN_DRAW_NUMBER || max > MAX_DRAW_NUMBER) {
    return `Use numbers from ${MIN_DRAW_NUMBER.toLocaleString()} to ${MAX_DRAW_NUMBER.toLocaleString()}.`;
  }

  if (min >= max) return "Minimum must be lower than maximum.";
  return null;
}
