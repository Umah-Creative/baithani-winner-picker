// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  toastError: vi.fn(),
  writeText: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: mocks.toastError },
}));

import type { SettingsShareState } from "../event-settings-share.type";
import { SettingsPreview } from "./settings-preview";

const defaultProps = {
  title: "Baithani Night",
  description: "Door prize draw",
  accentColor: "#d076b4",
  logoAlt: "Baithani logo",
  minRange: 1,
  maxRange: 100,
  excludedNumbers: [4],
};

beforeEach(() => {
  mocks.toastError.mockReset();
  mocks.writeText.mockReset();
  mocks.writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: mocks.writeText },
  });
});

afterEach(cleanup);

async function renderSharedLink(props: {
  shareState: SettingsShareState;
  shareUrl?: string;
}) {
  const user = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: mocks.writeText },
  });
  render(<SettingsPreview {...defaultProps} {...props} />);
  await user.click(screen.getByRole("tab", { name: "Shared link" }));
  return user;
}

describe("SettingsPreview shared-link copy", () => {
  it("copies the canonical URL and shows temporary success feedback", async () => {
    const user = await renderSharedLink({
      shareState: "saved",
      shareUrl: "https://winner-picker.baithani.example/",
    });

    await user.click(screen.getByRole("button", { name: "Copy event link" }));

    expect(mocks.writeText).toHaveBeenCalledWith(
      "https://winner-picker.baithani.example/"
    );
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
  });

  it("reports clipboard failures without claiming success", async () => {
    mocks.writeText.mockRejectedValue(new Error("Clipboard denied"));
    const user = await renderSharedLink({
      shareState: "saved",
      shareUrl: "https://winner-picker.baithani.example/",
    });

    await user.click(screen.getByRole("button", { name: "Copy event link" }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        "Could not copy the event link. Try again."
      );
    });
    expect(
      screen.getByRole("button", { name: "Copy event link" })
    ).toBeTruthy();
  });

  it("disables sharing until the first settings save", async () => {
    await renderSharedLink({
      shareState: "setup",
      shareUrl: "https://winner-picker.baithani.example/",
    });

    expect(
      screen
        .getByRole("button", { name: "Copy event link" })
        .hasAttribute("disabled")
    ).toBe(true);
    expect(
      screen.getByText("Save event settings before sharing this link.")
    ).toBeTruthy();
  });

  it("explains when no canonical URL can be resolved", async () => {
    await renderSharedLink({ shareState: "saved" });

    expect(
      screen
        .getByRole("button", { name: "Copy event link" })
        .hasAttribute("disabled")
    ).toBe(true);
    expect(
      screen.getByText("Set SITE_URL to enable link copying.")
    ).toBeTruthy();
  });

  it("allows copying a saved event while warning about draft changes", async () => {
    await renderSharedLink({
      shareState: "draft",
      shareUrl: "https://winner-picker.baithani.example/",
    });

    expect(
      screen
        .getByRole("button", { name: "Copy event link" })
        .hasAttribute("disabled")
    ).toBe(false);
    expect(
      screen.getByText(
        "This preview has unsaved changes. The copied link still opens the last saved version."
      )
    ).toBeTruthy();
  });
});
