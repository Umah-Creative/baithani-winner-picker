import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));

import {
  getCurrentRequestContext,
  getSafeCurrentRequestContext,
} from "./current-request-context.server";

afterEach(() => {
  vi.clearAllMocks();
});

describe("current request context", () => {
  it("reads only application-owned attribution", async () => {
    mocks.headers.mockResolvedValue(
      new Headers({
        "x-baithani-client-ip": "203.0.113.8",
        "x-baithani-request-id": "request-123",
        "x-request-id": "attacker-value",
      })
    );

    await expect(getCurrentRequestContext()).resolves.toEqual({
      ipAddress: "203.0.113.8",
      userAgent: null,
      acceptLanguage: null,
      requestId: "request-123",
    });
  });

  it("returns empty attribution without leaking failure details", async () => {
    mocks.headers.mockRejectedValue(
      new Error("private header value: do-not-log")
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(getSafeCurrentRequestContext()).resolves.toEqual({
      ipAddress: null,
      userAgent: null,
      acceptLanguage: null,
      requestId: null,
    });
    expect(consoleError).toHaveBeenCalledWith("Request attribution failed.");
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("do-not-log");
    consoleError.mockRestore();
  });
});
