// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { AdminAuditLogPage } from "@/lib/admin-logs.service";

import { LogsTable } from "../LogsTable";
import { serializeLogFilterDate } from "../LogFilters";

afterEach(cleanup);

const basePage: AdminAuditLogPage = {
  rows: [
    {
      id: 1,
      action: "settings.update",
      outcome: "success",
      actor: "admin",
      occurredAt: "2026-08-14T12:00:00.000Z",
      ipAddress: null,
      requestId: null,
      userAgent: "Vitest",
      acceptLanguage: "en",
      metadata: {
        before: { title: "Old", hasLogo: false, excludedNumbers: [] },
        after: { title: "New", hasLogo: true, excludedNumbers: [4, 7] },
      },
    },
  ],
  total: 1,
  totalPages: 1,
  filters: {
    page: 1,
    limit: 50,
    offset: 0,
  },
};

describe("LogsTable", () => {
  it("serializes local calendar dates without a UTC day shift", () => {
    expect(serializeLogFilterDate(new Date(2026, 7, 14))).toBe("2026-08-14");
  });

  it("uses composed filters and hides single-page pagination noise", () => {
    const { container } = render(<LogsTable page={basePage} />);

    expect(container.querySelector("select")).toBeNull();
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
    expect(screen.queryByText("50 per page")).toBeNull();
    expect(
      screen.queryByRole("navigation", { name: "Log pagination" })
    ).toBeNull();
    expect(screen.queryByRole("link", { name: "Reset" })).toBeNull();
  });

  it("shows human labels, explicit diff columns, and omits unavailable metadata", () => {
    render(<LogsTable page={basePage} />);

    expect(
      screen.getByRole("heading", { name: "Event settings updated" })
    ).toBeTruthy();
    expect(screen.getByText("Success")).toBeTruthy();
    expect(screen.queryByText("IP unavailable")).toBeNull();
    expect(screen.queryByText("Request ID unavailable")).toBeNull();

    const details = screen.getByText("View changes").closest("details");
    expect(details).toBeTruthy();
    const scoped = within(details as HTMLElement);
    expect(scoped.getByText("Field")).toBeTruthy();
    expect(scoped.getByText("Before")).toBeTruthy();
    expect(scoped.getByText("After")).toBeTruthy();
    expect(scoped.getByText("Logo present")).toBeTruthy();
    expect(scoped.getByText("settings.update")).toBeTruthy();
    expect(scoped.getByText("4, 7")).toBeTruthy();
  });

  it("keeps compatible filter values and reveals active advanced filters", () => {
    render(
      <LogsTable
        page={{
          ...basePage,
          filters: {
            ...basePage.filters,
            action: "logo.remove",
            outcome: "failure",
            from: "2026-08-01",
            to: "2026-08-14",
            ip: "203.0.113",
            requestId: "req-12",
          },
        }}
      />
    );

    expect(
      screen.getByRole("link", { name: "Reset" }).getAttribute("href")
    ).toBe("/admin/logs");
    expect(screen.getByLabelText("Active filters")).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>("IP address").value).toBe(
      "203.0.113"
    );
    expect(screen.getByLabelText<HTMLInputElement>("Request ID").value).toBe(
      "req-12"
    );
    expect(
      document.querySelector<HTMLInputElement>('input[name="from"]')?.value
    ).toBe("2026-08-01");
    expect(
      document.querySelector<HTMLInputElement>('input[name="to"]')?.value
    ).toBe("2026-08-14");
  });

  it("resets controlled filter values when the URL filters clear", () => {
    const filteredPage: AdminAuditLogPage = {
      ...basePage,
      filters: {
        ...basePage.filters,
        action: "logo.remove",
        outcome: "failure",
        from: "2026-08-01",
        to: "2026-08-14",
        ip: "203.0.113",
        requestId: "req-12",
      },
    };
    const { rerender } = render(<LogsTable page={filteredPage} />);

    rerender(<LogsTable page={basePage} />);

    const [actionSelect, outcomeSelect] = screen.getAllByRole("combobox");
    expect(actionSelect.textContent).toContain("All actions");
    expect(outcomeSelect.textContent).toContain("All outcomes");
    expect(screen.getByLabelText<HTMLInputElement>("IP address").value).toBe(
      ""
    );
    expect(screen.getByLabelText<HTMLInputElement>("Request ID").value).toBe(
      ""
    );
    expect(
      document.querySelector<HTMLInputElement>('input[name="from"]')?.value
    ).toBe("");
    expect(
      document.querySelector<HTMLInputElement>('input[name="to"]')?.value
    ).toBe("");
    expect(screen.queryByRole("link", { name: "Reset" })).toBeNull();
  });

  it("renders semantic link pagination only when multiple pages exist", () => {
    render(
      <LogsTable
        page={{
          ...basePage,
          total: 100,
          totalPages: 2,
          filters: { ...basePage.filters, page: 2, offset: 50 },
        }}
      />
    );

    expect(screen.getByText("50 per page")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Previous" }).getAttribute("href")
    ).toBe("/admin/logs");
    expect(screen.getByText("Next").getAttribute("aria-disabled")).toBe("true");
  });
});
