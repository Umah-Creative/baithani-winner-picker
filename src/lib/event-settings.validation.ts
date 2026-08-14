export type ExcludedNumbersParseResult =
  { ok: true; values: number[] } | { ok: false; error: string };

export function parseExcludedNumbers(
  raw: string,
  minRange: number,
  maxRange: number
): ExcludedNumbersParseResult {
  if (raw.trim() === "") {
    return { ok: true, values: [] };
  }

  const values: number[] = [];
  const seen = new Set<number>();

  for (const token of raw.split(/[\s,]+/).filter(Boolean)) {
    const value = token.trim();

    if (!/^\d+$/.test(value)) {
      return {
        ok: false,
        error: `Excluded number "${value}" must be a whole number.`,
      };
    }

    const number = Number(value);
    if (!Number.isSafeInteger(number)) {
      return {
        ok: false,
        error: `Excluded number "${value}" must be a whole number.`,
      };
    }

    if (number < minRange || number > maxRange) {
      return {
        ok: false,
        error: `Excluded number ${number} must be between ${minRange} and ${maxRange}.`,
      };
    }

    if (seen.has(number)) {
      continue;
    }

    seen.add(number);
    values.push(number);
  }

  return { ok: true, values: values.sort((a, b) => a - b) };
}

export function validateExcludedNumbers(
  values: number[],
  minRange: number,
  maxRange: number
): string | undefined {
  const seen = new Set<number>();

  for (const value of values) {
    if (!Number.isSafeInteger(value)) {
      return "Excluded numbers must be whole numbers.";
    }

    if (value < minRange || value > maxRange) {
      return `Excluded numbers must be between ${minRange} and ${maxRange}.`;
    }

    if (seen.has(value)) {
      return `Excluded number ${value} is a duplicate.`;
    }

    seen.add(value);
  }

  return undefined;
}
