// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/actions", () => ({ logoutAdmin: vi.fn() }));
vi.mock("@/components/theme/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

import { AdminHeader } from "../AdminHeader";

afterEach(cleanup);

describe("AdminHeader", () => {
  it("uses semantic links without Base UI nativeButton warnings", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <AdminHeader
        activeSection="logs"
        title="Audit logs"
        description="Review changes."
        showSettingsBackLink
      />
    );

    expect(
      screen
        .getByRole("link", { name: "Audit logs" })
        .getAttribute("aria-current")
    ).toBe("page");
    expect(
      screen
        .getByRole("link", { name: "Back to event settings" })
        .getAttribute("href")
    ).toBe("/admin");
    expect(
      screen.getByRole("link", { name: /Open picker/ }).getAttribute("target")
    ).toBe("_blank");
    expect(
      screen.getByRole("link", { name: /Open picker/ }).getAttribute("rel")
    ).toBe("noopener noreferrer");
    expect(screen.getByRole("button", { name: "Log out" }).className).toContain(
      "text-destructive"
    );
    expect(
      consoleError.mock.calls.some((call) =>
        call.some((value) => String(value).includes("nativeButton"))
      )
    ).toBe(false);

    consoleError.mockRestore();
  });
});
