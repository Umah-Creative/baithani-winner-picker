import { describe, expect, it } from "vitest";

import {
  createEventSettingsDraft,
  eventSettingsDraftReducer,
} from "./event-settings-draft.reducer";

const settings = {
  title: "Baithani Night",
  description: "Door prize",
  accentColor: "#d076b4",
  hasLogo: true,
  logoAlt: "Baithani logo",
  minRange: 1,
  maxRange: 100,
  excludedNumbers: [4],
  updatedAt: "2026-08-15T00:00:00.000Z",
};

describe("eventSettingsDraftReducer", () => {
  it("marks patches dirty and resets all draft media state from canonical save", () => {
    let draft = createEventSettingsDraft(settings);
    draft = eventSettingsDraftReducer(draft, {
      type: "patch",
      patch: { title: "Unsaved title", replacementLogoUrl: "blob:logo" },
    });
    draft = eventSettingsDraftReducer(draft, { type: "mark-dirty" });

    expect(draft.dirty).toBe(true);
    expect(draft.replacementLogoUrl).toBe("blob:logo");

    const saved = { ...settings, title: "Committed title", hasLogo: false };
    draft = eventSettingsDraftReducer(draft, {
      type: "canonical-saved",
      saved,
    });

    expect(draft).toMatchObject({
      title: "Committed title",
      dirty: false,
      logoVisible: false,
      replacementLogoUrl: undefined,
      savedAt: saved.updatedAt,
      logoRevision: 1,
      excludedRevision: 1,
    });
  });
});
