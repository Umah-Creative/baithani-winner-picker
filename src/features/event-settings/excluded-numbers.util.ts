export function sanitizeExcludedNumbersInput(value: string): string {
  return value.replace(/[^\d,\s]/g, "");
}
