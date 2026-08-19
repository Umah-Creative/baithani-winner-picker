import { describe, expect, it } from "vitest";

import { resolveLogoChange } from "./event-settings-audit";

describe("resolveLogoChange", () => {
  it("gives a replacement file precedence over removal intent", () => {
    expect(
      resolveLogoChange({
        hasExistingLogo: true,
        hasReplacementLogo: true,
        removeLogo: true,
      })
    ).toBe("replace");
  });
});
