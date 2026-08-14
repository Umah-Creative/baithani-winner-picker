import { MAX_PICKER_RANGE, MIN_PICKER_RANGE } from "./picker.constant";

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

  if (min < MIN_PICKER_RANGE || max > MAX_PICKER_RANGE) {
    return `Use numbers from ${MIN_PICKER_RANGE.toLocaleString()} to ${MAX_PICKER_RANGE.toLocaleString()}.`;
  }

  if (min >= max) return "Minimum must be lower than maximum.";
  return null;
}
