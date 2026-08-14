import {
  MAX_EVENT_RANGE,
  MIN_EVENT_RANGE,
} from "@/features/event-settings/event-settings.constant";

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

  if (min < MIN_EVENT_RANGE || max > MAX_EVENT_RANGE) {
    return `Use numbers from ${MIN_EVENT_RANGE.toLocaleString()} to ${MAX_EVENT_RANGE.toLocaleString()}.`;
  }

  if (min >= max) return "Minimum must be lower than maximum.";
  return null;
}
