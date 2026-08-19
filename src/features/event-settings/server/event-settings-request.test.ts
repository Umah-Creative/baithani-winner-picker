import { describe, expect, it } from "vitest";

import { DEFAULT_ACCENT_COLOR } from "../event-settings.constant";
import { parseEventSettingsFormData } from "./event-settings-request";

function validFormData(): FormData {
  const formData = new FormData();
  formData.set("title", "  Baithani Night  ");
  formData.set("description", "  Door prize draw  ");
  formData.set("minRange", "1");
  formData.set("maxRange", "100");
  formData.set("excludedNumbers", "11, 4, 11");
  formData.set("logoAlt", "  Baithani mark  ");
  return formData;
}

describe("parseEventSettingsFormData", () => {
  it("normalizes form transport into persistence input", async () => {
    const result = await parseEventSettingsFormData(validFormData());

    expect(result).toEqual({
      ok: true,
      input: {
        title: "Baithani Night",
        description: "Door prize draw",
        accentColor: DEFAULT_ACCENT_COLOR,
        minRange: 1,
        maxRange: 100,
        excludedNumbers: [4, 11],
        logoAlt: "Baithani mark",
        logoBytes: null,
        logoMime: null,
        removeLogo: false,
      },
    });
  });

  it("converts an uploaded logo and preserves removal intent", async () => {
    const formData = validFormData();
    formData.set(
      "logo",
      new File(["logo-bytes"], "logo.png", { type: "image/png" })
    );
    formData.set("removeLogo", "on");

    const result = await parseEventSettingsFormData(formData);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.input.logoMime).toBe("image/png");
      expect(result.input.logoBytes?.toString()).toBe("logo-bytes");
      expect(result.input.removeLogo).toBe(true);
    }
  });

  it("returns field errors before persistence for invalid exclusions", async () => {
    const formData = validFormData();
    formData.set("excludedNumbers", "101");

    await expect(parseEventSettingsFormData(formData)).resolves.toEqual({
      ok: false,
      fieldErrors: {
        excludedNumbers: "Excluded number 101 must be between 1 and 100.",
      },
    });
  });
});
