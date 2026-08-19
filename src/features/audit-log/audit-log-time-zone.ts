import { TZDate } from "@date-fns/tz";

const MAX_TIME_ZONE_LENGTH = 100;

export function isValidTimeZone(value: string | undefined): value is string {
  if (!value || value.length > MAX_TIME_ZONE_LENGTH) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function localDateBoundaryToUtc(
  date: string,
  timeZone: string,
  nextDay = false
): Date | undefined {
  if (!isValidTimeZone(timeZone)) return undefined;
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return undefined;

  return new Date(
    new TZDate(year, month - 1, day + (nextDay ? 1 : 0), timeZone).getTime()
  );
}
