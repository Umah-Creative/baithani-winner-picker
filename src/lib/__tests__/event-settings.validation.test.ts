import { describe, expect, it } from "vitest";

import {
  parseExcludedNumbers,
  validateExcludedNumbers,
} from "../event-settings.validation";

describe("parseExcludedNumbers", () => {
  it("parses whole numbers within the configured range", () => {
    expect(parseExcludedNumbers("2, 4, 10", 1, 10)).toEqual({
      ok: true,
      values: [2, 4, 10],
    });
  });

  it("ignores empty tokens, accepts whitespace, deduplicates, and sorts", () => {
    expect(parseExcludedNumbers(" 4, , 2\n4   10,", 1, 10)).toEqual({
      ok: true,
      values: [2, 4, 10],
    });
  });

  it.each([
    ["2, 2.5", "whole number"],
    ["0, 4", "between 1 and 10"],
    ["2, 11", "between 1 and 10"],
  ])("rejects invalid value in %s", (raw, message) => {
    const result = parseExcludedNumbers(raw, 1, 10);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain(message);
    }
  });
});

describe("validateExcludedNumbers", () => {
  it("rejects invalid persisted input instead of trusting the form parser", () => {
    expect(validateExcludedNumbers([2, 2], 1, 10)).toContain("duplicate");
  });
});
