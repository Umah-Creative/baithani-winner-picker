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
vi.mock("../AdminHeader", () => ({
  AdminHeader: () => <header>Admin</header>,
}));
vi.mock("../SettingsForm", () => ({
  SettingsForm: () => <form>Settings</form>,
}));

import AdminPage from "../page";

afterEach(cleanup);

describe("AdminPage", () => {
  it("renders the shared footer for authenticated administrators", async () => {
    mocks.isAdminAuthenticated.mockResolvedValue(true);
    mocks.getEventSettings.mockResolvedValue(null);

    render(await AdminPage());

    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });
});
