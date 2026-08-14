import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const query = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  };
  return { query, select: vi.fn() };
});

vi.mock("@/db/client", () => ({ db: { select: mocks.select } }));

import { getEventLogoMedia } from "./event-settings-media.query";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.select.mockReturnValue(mocks.query);
  mocks.query.from.mockReturnValue(mocks.query);
  mocks.query.where.mockReturnValue(mocks.query);
});

describe("getEventLogoMedia", () => {
  it("projects persisted bytes and MIME type for the HTTP adapter", async () => {
    mocks.query.limit.mockResolvedValue([
      { logoBytes: Buffer.from("logo"), logoMime: "image/webp" },
    ]);

    const media = await getEventLogoMedia();

    expect(media?.mime).toBe("image/webp");
    expect(Buffer.from(media?.bytes ?? new ArrayBuffer(0)).toString()).toBe(
      "logo"
    );
  });

  it("returns null when no logo is configured", async () => {
    mocks.query.limit.mockResolvedValue([{ logoBytes: null, logoMime: null }]);

    await expect(getEventLogoMedia()).resolves.toBeNull();
  });
});
