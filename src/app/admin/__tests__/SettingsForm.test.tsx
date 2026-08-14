// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/actions", () => ({
  updateEventSettings: vi.fn(),
}));

import { SettingsForm } from "../SettingsForm";

afterEach(cleanup);

const settings = {
  title: "Baithani Night",
  description: "Door prize draw",
  accentColor: "#d076b4",
  hasLogo: true,
  logoAlt: "Baithani logo",
  minRange: 1,
  maxRange: 100,
  excludedNumbers: [4],
  updatedAt: "2026-08-14T12:00:00.000Z",
};

describe("SettingsForm logo controls", () => {
  it("previews an accepted replacement file with its filename and size", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    const logo = new File(["logo"], "baithani.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Logo"), logo);

    expect(screen.getByText("baithani.png")).toBeTruthy();
    expect(
      screen.getByRole("img", { name: "Preview of baithani.png" })
    ).toBeTruthy();
  });

  it("clears an invalid file so it cannot be submitted", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<SettingsForm settings={settings} />);

    const input = screen.getByLabelText<HTMLInputElement>("Logo");
    await user.upload(
      input,
      new File(["not a logo"], "logo.txt", { type: "text/plain" })
    );

    expect(input.files).toHaveLength(0);
    expect(
      screen.getByText("Logo must be PNG, JPEG, WebP, or GIF.")
    ).toBeTruthy();
  });

  it("warns when editable logo alt text is left blank", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    await user.clear(screen.getByLabelText("Logo alt text"));

    expect(
      screen.getByText(
        "Blank alt text is only appropriate when this logo is decorative."
      )
    ).toBeTruthy();
  });
});

describe("SettingsForm accent color", () => {
  it("warns for a color with weak contrast against one text color", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    await user.clear(screen.getByLabelText("Accent color"));
    await user.type(screen.getByLabelText("Accent color"), "#777777");

    expect(
      screen.getByText(
        "This color has limited contrast with one or more text colors. Check button labels carefully."
      )
    ).toBeTruthy();
  });
});

describe("SettingsForm excluded-number editor", () => {
  it("turns comma-separated entries into removable tokens when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    const input = screen.getByLabelText("Excluded numbers");
    await user.type(input, "11, 12{Enter}");

    expect(screen.getByRole("button", { name: "Remove 11" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove 12" })).toBeTruthy();
    expect(screen.getByText("97 eligible numbers")).toBeTruthy();
  });

  it("uses the live range when it validates entries and counts eligibility", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    await user.clear(screen.getByLabelText("Min range"));
    await user.type(screen.getByLabelText("Min range"), "5");
    await user.type(screen.getByLabelText("Excluded numbers"), "3{Enter}");

    expect(
      screen.getByText("Excluded number 3 must be between 5 and 100.")
    ).toBeTruthy();
    expect(screen.getByText("96 eligible numbers")).toBeTruthy();
  });
});

describe("SettingsForm logo replacement precedence", () => {
  it("clears a pending removal when a replacement is selected", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    await user.click(
      screen.getByRole("checkbox", { name: "Remove current logo" })
    );
    await user.click(screen.getByRole("button", { name: "Mark for removal" }));
    await user.upload(
      screen.getByLabelText("Logo"),
      new File(["logo"], "replacement.webp", { type: "image/webp" })
    );

    expect(
      screen.getByRole<HTMLInputElement>("checkbox", {
        name: "Remove current logo",
      }).checked
    ).toBe(false);
    expect(
      screen.getByText(
        "Replacement selected. Current logo will be kept until you save."
      )
    ).toBeTruthy();
  });
});
