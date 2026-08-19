// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAdminAuthenticated: vi.fn(),
  getEventSettings: vi.fn(),
}));

vi.mock("@/features/admin-auth/server/admin-session.service", () => ({
  isAdminAuthenticated: mocks.isAdminAuthenticated,
}));
vi.mock("@/features/event-settings/server/event-settings.query", () => ({
  getEventSettings: mocks.getEventSettings,
}));
vi.mock("@/components/theme/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));
vi.mock("@/features/admin-auth/admin-login-form", () => ({
  AdminLoginForm: () => <form>Login</form>,
}));

import AdminLoginPage from "../page";

afterEach(cleanup);

describe("AdminLoginPage", () => {
  it("renders the shared footer before authentication", async () => {
    mocks.isAdminAuthenticated.mockResolvedValue(false);
    mocks.getEventSettings.mockResolvedValue(null);

    render(await AdminLoginPage());

    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });
});
