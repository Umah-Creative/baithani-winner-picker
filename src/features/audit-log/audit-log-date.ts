import { format, isValid, parse } from "date-fns";
import type { DateRange } from "react-day-picker";

export function parseLogFilterDate(
  value: string | undefined
): Date | undefined {
  if (!value) return undefined;
  const date = parse(value, "yyyy-MM-dd", new Date());
  return isValid(date) ? date : undefined;
}

export function formatLogDateRange(range: DateRange | undefined): string {
  if (!range?.from) return "Choose date range";
  if (!range.to) return format(range.from, "MMM d, yyyy");
  return `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`;
}

export function serializeLogFilterDate(date: Date | undefined): string {
  return date ? format(date, "yyyy-MM-dd") : "";
}
