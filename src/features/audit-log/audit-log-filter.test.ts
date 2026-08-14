import { describe, expect, it } from "vitest";

import { clampAdminLogPage, parseAdminLogFilters } from "./audit-log-filter";

describe("parseAdminLogFilters", () => {
  it("normalizes log filters and keeps 50 rows per page", () => {
    expect(
      parseAdminLogFilters({
        action: "settings.update",
        outcome: "success",
        from: "2026-08-01",
        to: "2026-08-14",
        ip: "203.0.113.8",
        requestId: "req-123",
        page: "3",
      })
    ).toEqual({
      action: "settings.update",
      outcome: "success",
      from: "2026-08-01",
      to: "2026-08-14",
      ip: "203.0.113.8",
      requestId: "req-123",
      page: 3,
      limit: 50,
      offset: 100,
    });
  });

  it("drops invalid filters and clamps pagination to first page", () => {
    expect(
      parseAdminLogFilters({
        action: "not-real",
        outcome: "unknown",
        from: "tomorrow",
        to: "yesterday",
        page: "0",
      })
    ).toMatchObject({ page: 1, limit: 50, offset: 0 });
  });

  it("rejects impossible calendar dates", () => {
    expect(parseAdminLogFilters({ from: "2026-02-31" }).from).toBeUndefined();
  });

  it("clamps requested pages after the matching event count is known", () => {
    expect(
      clampAdminLogPage(parseAdminLogFilters({ page: "999999" }), 51)
    ).toMatchObject({
      page: 2,
      offset: 50,
    });
  });
});
