// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAdminAuthenticated: vi.fn(),
  getEventSettings: vi.fn(),
}));

vi.mock("@/lib/auth.service", () => ({
  isAdminAuthenticated: mocks.isAdminAuthenticated,
}));
vi.mock("@/lib/event-settings.service", () => ({
  getEventSettings: mocks.getEventSettings,
}));
vi.mock("@/components/theme/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));
vi.mock("../LoginForm", () => ({
  LoginForm: () => <form>Login</form>,
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
