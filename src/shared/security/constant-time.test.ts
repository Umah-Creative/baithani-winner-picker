import { describe, expect, it } from "vitest";

import { constantTimeEqual } from "./constant-time.server";

describe("constantTimeEqual", () => {
  it("accepts identical UTF-8 values and rejects different values or lengths", () => {
    expect(constantTimeEqual("correct horse", "correct horse")).toBe(true);
    expect(constantTimeEqual("correct horse", "correct house")).toBe(false);
    expect(constantTimeEqual("short", "much-longer")).toBe(false);
    expect(constantTimeEqual("pässword", "pässword")).toBe(true);
  });
});
