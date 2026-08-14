// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getEventSettings: vi.fn(),
}));

vi.mock("@/lib/event-settings.service", () => ({
  getEventSettings: mocks.getEventSettings,
}));
vi.mock("@/components/picker/Picker", () => ({
  Picker: () => <div>Picker</div>,
}));

import Home from "../page";

afterEach(cleanup);

describe("Home", () => {
  it("keeps the project footer in the first-run state", async () => {
    mocks.getEventSettings.mockResolvedValue(null);

    render(await Home());

    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /View source on GitHub/ })
    ).toBeTruthy();
  });
});
