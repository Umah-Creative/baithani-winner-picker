// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppFooter, REPOSITORY_URL } from "../app-footer";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("AppFooter", () => {
  it("shows current copyright and a safe external source link", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-14T00:00:00.000Z"));

    render(<AppFooter />);

    expect(screen.getByRole("contentinfo").textContent).toContain(
      "© 2023–2026 · Powered by Multimedia Baithani."
    );
    const attribution = screen.getByText("Multimedia Baithani");
    expect(attribution.tagName).toBe("STRONG");
    expect(attribution.className).toContain("font-semibold");
    expect(attribution.className).toContain("text-foreground");

    const repositoryLink = screen.getByRole("link", {
      name: "View source on GitHub (opens in a new tab)",
    });
    expect(repositoryLink.getAttribute("href")).toBe(REPOSITORY_URL);
    expect(repositoryLink.getAttribute("target")).toBe("_blank");
    expect(repositoryLink.getAttribute("rel")).toBe("noopener noreferrer");
    expect(repositoryLink.textContent).toBe("");
    expect(repositoryLink.querySelector("svg")).toBeTruthy();
  });
});
