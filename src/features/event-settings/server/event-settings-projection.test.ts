import { describe, expect, it } from "vitest";

import { ACTIVE_EVENT_SETTINGS_ID } from "../event-settings.constant";
import { toEventSettingsView } from "./event-settings-projection";

describe("event settings constants and projection", () => {
  it("projects the active persisted row into client-safe settings", () => {
    expect(ACTIVE_EVENT_SETTINGS_ID).toBe(1);
    expect(
      toEventSettingsView({
        id: ACTIVE_EVENT_SETTINGS_ID,
        title: "Baithani Night",
        description: "Door prize draw",
        accentColor: "#d076b4",
        logoBytes: Buffer.from("logo"),
        logoMime: "image/png",
        logoAlt: null,
        minRange: 1,
        maxRange: 100,
        excludedNumbers: [4],
        updatedAt: new Date("2026-08-15T00:00:00.000Z"),
      })
    ).toEqual({
      title: "Baithani Night",
      description: "Door prize draw",
      accentColor: "#d076b4",
      hasLogo: true,
      logoAlt: "Baithani Night",
      minRange: 1,
      maxRange: 100,
      excludedNumbers: [4],
      updatedAt: "2026-08-15T00:00:00.000Z",
    });
  });
});
