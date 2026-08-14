// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateEventSettings: vi.fn(),
}));

vi.mock("./event-settings.action", () => ({
  updateEventSettings: mocks.updateEventSettings,
}));

import { SettingsForm } from "./event-settings-form";

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

beforeEach(() => {
  mocks.updateEventSettings.mockReset();
  mocks.updateEventSettings.mockResolvedValue({});
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("SettingsForm logo controls", () => {
  it("previews an accepted replacement inside the upload container", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    const logo = new File(["logo"], "baithani.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Logo"), logo);

    const dropzone = screen.getByTestId("logo-dropzone");
    expect(within(dropzone).getByText("baithani.png")).toBeTruthy();
    expect(
      within(dropzone).getByRole("img", {
        name: "Preview of baithani.png",
      })
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
    expect(screen.getByText("Current event logo")).toBeTruthy();
  });

  it("assigns a dropped logo to the native form input", () => {
    class DataTransferMock {
      files: File[] = [];
      items = {
        add: (file: File) => this.files.push(file),
      };
    }
    vi.stubGlobal("DataTransfer", DataTransferMock);
    render(<SettingsForm settings={settings} />);

    const logo = new File(["logo"], "dropped.png", { type: "image/png" });
    const input = screen.getByLabelText<HTMLInputElement>("Logo");
    let assignedFiles: File[] = [];
    Object.defineProperty(input, "files", {
      configurable: true,
      get: () => assignedFiles,
      set: (files: File[]) => {
        assignedFiles = files;
      },
    });
    fireEvent.drop(screen.getByTestId("logo-dropzone"), {
      dataTransfer: { files: [logo] },
    });

    expect(input.files?.[0]).toBe(logo);
  });

  it("shows alt text only while a logo is visible", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    await user.clear(screen.getByLabelText("Logo alt text"));
    expect(
      screen.getByText(
        "Blank alt text is only appropriate when this logo is decorative."
      )
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.queryByLabelText("Logo alt text")).toBeNull();
    expect(screen.getByText("Logo marked for removal")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Undo removal" }));
    expect(screen.getByLabelText("Logo alt text")).toBeTruthy();
  });

  it("selecting a replacement after removal clears removal intent", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    await user.click(screen.getByRole("button", { name: "Remove" }));
    await user.upload(
      screen.getByLabelText("Logo"),
      new File(["logo"], "replacement.webp", { type: "image/webp" })
    );

    expect(screen.getByText("replacement.webp")).toBeTruthy();
    expect(
      document.querySelector<HTMLInputElement>('input[name="removeLogo"]')
        ?.value
    ).toBe("");
  });

  it("removing after replacement clears the selected file", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    const input = screen.getByLabelText<HTMLInputElement>("Logo");
    await user.upload(
      input,
      new File(["logo"], "replacement.webp", { type: "image/webp" })
    );
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(input.files).toHaveLength(0);
    expect(screen.getByText("Logo marked for removal")).toBeTruthy();
    expect(
      document.querySelector<HTMLInputElement>('input[name="removeLogo"]')
        ?.value
    ).toBe("on");
  });

  it("resets replacement state and the native input after save", async () => {
    mocks.updateEventSettings.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    await user.upload(
      screen.getByLabelText("Logo"),
      new File(["logo"], "replacement.png", { type: "image/png" })
    );
    await user.click(screen.getByRole("button", { name: "Save settings" }));

    await waitFor(() => {
      expect(screen.queryByText("replacement.png")).toBeNull();
    });
    expect(screen.getByText("Current event logo")).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>("Logo").files).toHaveLength(
      0
    );
  });

  it("releases replacement blob URLs when the editor unmounts", async () => {
    const createObjectURL = vi.fn(() => "blob:replacement-logo");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const user = userEvent.setup();
    const view = render(<SettingsForm settings={settings} />);

    await user.upload(
      screen.getByLabelText("Logo"),
      new File(["logo"], "replacement.png", { type: "image/png" })
    );
    view.unmount();

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:replacement-logo");
  });
});

describe("SettingsForm excluded-number editor", () => {
  it("adds whole numbers with the action button and Enter", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    const input = screen.getByLabelText("Excluded numbers");
    await user.type(input, "11");
    await user.click(screen.getByRole("button", { name: "Add number" }));
    await user.type(input, "12{Enter}");

    expect(screen.getByRole("button", { name: "Remove 11" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove 12" })).toBeTruthy();
    expect(screen.getByText("97 eligible numbers")).toBeTruthy();
  });

  it("adds comma- and line-separated values from the progressive bulk control", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    await user.click(screen.getByText("Paste multiple numbers"));
    await user.type(
      screen.getByLabelText("Numbers to paste"),
      "11, 12{enter}13"
    );
    await user.click(
      screen.getByRole("button", { name: "Add pasted numbers" })
    );

    expect(screen.getByRole("button", { name: "Remove 11" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove 12" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove 13" })).toBeTruthy();
  });

  it("uses the live range and silently deduplicates", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    await user.clear(screen.getByLabelText("Min range"));
    await user.type(screen.getByLabelText("Min range"), "5");
    await user.type(screen.getByLabelText("Excluded numbers"), "3{Enter}");
    expect(
      screen.getByText("Excluded number 3 must be between 5 and 100.")
    ).toBeTruthy();

    await user.clear(screen.getByLabelText("Min range"));
    await user.type(screen.getByLabelText("Min range"), "1");
    await user.clear(screen.getByLabelText("Excluded numbers"));
    await user.type(screen.getByLabelText("Excluded numbers"), "4{Enter}");
    expect(screen.queryByText("Excluded number 4 is a duplicate.")).toBeNull();
    expect(screen.getAllByRole("button", { name: "Remove 4" })).toHaveLength(1);
  });

  it("ignores empty pasted values and strips non-numeric text", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    await user.click(screen.getByText("Paste multiple numbers"));
    const textarea = screen.getByLabelText("Numbers to paste");
    await user.type(textarea, " 11,, alpha 12{enter}{enter}11, 13 ");
    expect((textarea as HTMLTextAreaElement).value).toBe(
      " 11,,  12\n\n11, 13 "
    );

    await user.click(
      screen.getByRole("button", { name: "Add pasted numbers" })
    );
    expect(screen.getByRole("button", { name: "Remove 11" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove 12" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove 13" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Remove 11" })).toHaveLength(
      1
    );
  });

  it("submits a valid unfinished draft instead of silently dropping it", async () => {
    mocks.updateEventSettings.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    await user.type(screen.getByLabelText("Excluded numbers"), "11");
    await user.click(screen.getByRole("button", { name: "Save settings" }));

    await waitFor(() => expect(mocks.updateEventSettings).toHaveBeenCalled());
    const formData = mocks.updateEventSettings.mock.calls[0][1] as FormData;
    expect(formData.get("excludedNumbers")).toBe("4,11");
    expect(screen.getByRole("button", { name: "Remove 11" })).toBeTruthy();
  });
});

describe("SettingsForm appearance presets", () => {
  it("offers named color advice and marks a selected preset as active", async () => {
    const user = userEvent.setup();
    render(<SettingsForm settings={settings} />);

    const preset = screen.getByRole("button", {
      name: "Use Stage blue (#4f7cac) accent color",
    });
    expect(preset.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("Calm, clear blue")).toBeTruthy();

    await user.click(preset);

    expect(screen.getByLabelText<HTMLInputElement>("Accent color").value).toBe(
      "#4f7cac"
    );
    expect(preset.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Unsaved changes")).toBeTruthy();
  });
});

describe("SettingsForm previews and status", () => {
  it("does not claim an unsaved initial setup is saved", () => {
    render(<SettingsForm settings={null} />);

    expect(screen.getByText("Setup not saved yet")).toBeTruthy();
    expect(screen.queryByText("All changes saved")).toBeNull();
  });

  it("updates picker and shared-link previews from one content source", async () => {
    const user = userEvent.setup();
    render(
      <SettingsForm
        settings={settings}
        shareUrl="https://winner-picker.baithani.example/"
      />
    );

    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Friday draw");
    await user.clear(screen.getByLabelText("Description"));
    await user.type(screen.getByLabelText("Description"), "Doors at six");

    const preview = screen.getByLabelText("Settings preview");
    expect(within(preview).getByText("Friday draw")).toBeTruthy();
    expect(within(preview).getByText("Doors at six")).toBeTruthy();
    expect(within(preview).getByText("1–100 · 1 excluded")).toBeTruthy();

    await user.click(within(preview).getByRole("tab", { name: "Shared link" }));
    expect(within(preview).getByText("Multimedia Baithani")).toBeTruthy();
    expect(
      within(preview).getByText(
        "This preview has unsaved changes. The copied link still opens the last saved version."
      )
    ).toBeTruthy();
  });
});
