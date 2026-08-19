// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AuditLogTimestamp } from "./audit-log-timestamp";

afterEach(cleanup);

describe("AuditLogTimestamp", () => {
  it("renders an absolute ISO value and formats it in the browser timezone", async () => {
    render(
      <AuditLogTimestamp
        occurredAt="2026-08-14T12:00:00.000Z"
        timeZone="Asia/Makassar"
      />
    );

    const time = screen.getByText(/Aug 14, 2026/).closest("time");
    expect(time).toBeTruthy();
    expect(time?.getAttribute("datetime")).toBe("2026-08-14T12:00:00.000Z");
    await waitFor(() => expect(time?.textContent).toMatch(/Aug 14, 2026/));
    expect(time?.textContent).toMatch(/GMT\+8|WITA/);
  });
});
