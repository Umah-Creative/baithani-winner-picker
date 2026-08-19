import { describe, expect, it } from "vitest";

import { formatAuditSettingsDiff } from "./audit-log-settings-diff";

describe("formatAuditSettingsDiff", () => {
  it("shows only changed, sanitized settings fields", () => {
    expect(
      formatAuditSettingsDiff({
        before: {
          title: "Old draw",
          accentColor: "#d076b4",
          excludedNumbers: [13],
          password: "never show this",
        },
        after: {
          title: "New draw",
          accentColor: "#d076b4",
          excludedNumbers: [13, 42],
          token: "nope",
        },
      })
    ).toEqual([
      { field: "title", before: "Old draw", after: "New draw" },
      { field: "excludedNumbers", before: [13], after: [13, 42] },
    ]);
  });
});
