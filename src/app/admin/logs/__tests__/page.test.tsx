// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAdminAuthenticated: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("redirected");
  }),
  getAdminAuditLogPage: vi.fn(),
}));

vi.mock("@/lib/auth.service", () => ({
  isAdminAuthenticated: mocks.isAdminAuthenticated,
}));
vi.mock("@/lib/actions", () => ({ logoutAdmin: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/admin-logs.service", () => ({
  getAdminAuditLogPage: mocks.getAdminAuditLogPage,
}));
vi.mock("../../AdminHeader", () => ({
  AdminHeader: () => <header>Admin</header>,
}));
vi.mock("../LogsTable", () => ({
  LogsTable: () => <div>Logs</div>,
}));

import AdminLogsPage from "../page";

describe("AdminLogsPage", () => {
  afterEach(cleanup);

  it("redirects unauthenticated requests before loading audit data", async () => {
    mocks.isAdminAuthenticated.mockResolvedValue(false);

    await expect(
      AdminLogsPage({ searchParams: Promise.resolve({}) })
    ).rejects.toThrow("redirected");

    expect(mocks.redirect).toHaveBeenCalledWith("/admin/login");
  });

  it("renders the shared footer for authenticated administrators", async () => {
    mocks.isAdminAuthenticated.mockResolvedValue(true);
    mocks.getAdminAuditLogPage.mockResolvedValue({});

    render(await AdminLogsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });
});
