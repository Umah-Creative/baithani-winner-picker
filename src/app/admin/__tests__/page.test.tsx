// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAdminAuthenticated: vi.fn(),
  getEventSettings: vi.fn(),
  resolveSiteUrl: vi.fn(),
}));

vi.mock("@/lib/auth.service", () => ({
  isAdminAuthenticated: mocks.isAdminAuthenticated,
}));
vi.mock("@/lib/event-settings.service", () => ({
  getEventSettings: mocks.getEventSettings,
}));
vi.mock("@/lib/site-url", () => ({
  resolveSiteUrl: mocks.resolveSiteUrl,
}));
vi.mock("../AdminHeader", () => ({
  AdminHeader: () => <header>Admin</header>,
}));
vi.mock("../SettingsForm", () => ({
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
    expect(screen.getByText("Settings").getAttribute("data-share-url")).toBe(
      "https://winner-picker.baithani.example/"
    );
  });
});
