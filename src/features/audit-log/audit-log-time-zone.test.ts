import { describe, expect, it } from "vitest";

import { isValidTimeZone, localDateBoundaryToUtc } from "./audit-log-time-zone";

describe("audit log timezone boundaries", () => {
  it("converts WITA calendar-day boundaries to UTC", () => {
    expect(
      localDateBoundaryToUtc("2026-08-01", "Asia/Makassar")?.toISOString()
    ).toBe("2026-07-31T16:00:00.000Z");
    expect(
      localDateBoundaryToUtc("2026-08-14", "Asia/Makassar", true)?.toISOString()
    ).toBe("2026-08-14T16:00:00.000Z");
  });

  it("uses the correct next-day boundary across daylight-saving changes", () => {
    expect(
      localDateBoundaryToUtc("2026-03-08", "America/New_York")?.toISOString()
    ).toBe("2026-03-08T05:00:00.000Z");
    expect(
      localDateBoundaryToUtc(
        "2026-03-08",
        "America/New_York",
        true
      )?.toISOString()
    ).toBe("2026-03-09T04:00:00.000Z");
  });

  it("validates IANA timezones and rejects arbitrary strings", () => {
    expect(isValidTimeZone("Asia/Makassar")).toBe(true);
    expect(isValidTimeZone("Not/A_Timezone")).toBe(false);
    expect(isValidTimeZone("x".repeat(101))).toBe(false);
  });
});
