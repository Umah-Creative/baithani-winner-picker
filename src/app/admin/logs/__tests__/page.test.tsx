import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAdminAuthenticated: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("redirected");
  }),
}));

vi.mock("@/lib/auth.service", () => ({
  isAdminAuthenticated: mocks.isAdminAuthenticated,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/admin-logs.service", () => ({
  getAdminAuditLogPage: vi.fn(),
}));

import AdminLogsPage from "../page";

describe("AdminLogsPage", () => {
  it("redirects unauthenticated requests before loading audit data", async () => {
    mocks.isAdminAuthenticated.mockResolvedValue(false);

    await expect(
      AdminLogsPage({ searchParams: Promise.resolve({}) })
    ).rejects.toThrow("redirected");

    expect(mocks.redirect).toHaveBeenCalledWith("/admin/login");
  });
});
