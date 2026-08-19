// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAdminAuthenticated: vi.fn(),
  getEventSettings: vi.fn(),
  resolveSiteUrl: vi.fn(),
}));

vi.mock("@/features/admin-auth/server/admin-session.service", () => ({
  isAdminAuthenticated: mocks.isAdminAuthenticated,
}));
vi.mock("@/features/event-settings/server/event-settings.query", () => ({
  getEventSettings: mocks.getEventSettings,
}));
vi.mock("@/shared/site-url/resolve-site-url.server", () => ({
  resolveSiteUrl: mocks.resolveSiteUrl,
}));
vi.mock("@/features/admin-auth/admin-auth.action", () => ({
  logoutAdmin: vi.fn(),
}));
vi.mock("@/components/theme/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));
vi.mock("@/features/event-settings/event-settings-form", () => ({
  SettingsForm: (props: { shareUrl?: string }) => (
    <form data-share-url={props.shareUrl}>Settings</form>
  ),
}));

import AdminPage from "../page";

afterEach(cleanup);

describe("AdminPage", () => {
  it("renders the shared footer for authenticated administrators", async () => {
    mocks.isAdminAuthenticated.mockResolvedValue(true);
    mocks.getEventSettings.mockResolvedValue(null);
    mocks.resolveSiteUrl.mockResolvedValue(
      new URL("https://winner-picker.baithani.example")
    );

    render(await AdminPage());

    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(
      screen
        .getByText("Settings", { selector: "form" })
        .getAttribute("data-share-url")
    ).toBe("https://winner-picker.baithani.example/");
  });
});
