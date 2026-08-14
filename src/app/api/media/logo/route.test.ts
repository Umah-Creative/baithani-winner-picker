import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ media: vi.fn() }));

vi.mock("@/features/event-settings/server/event-settings-media.query", () => ({
  getEventLogoMedia: mocks.media,
}));

import { GET } from "./route";

beforeEach(() => vi.clearAllMocks());

describe("GET /api/media/logo", () => {
  it("maps event logo media into a cacheable, nosniff response", async () => {
    mocks.media.mockResolvedValue({
      bytes: Uint8Array.from([1, 2, 3]).buffer,
      mime: "image/png",
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("cache-control")).toContain("max-age=3600");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      Uint8Array.from([1, 2, 3])
    );
  });

  it("returns 404 when the event has no logo", async () => {
    mocks.media.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe("No logo configured");
  });
});
