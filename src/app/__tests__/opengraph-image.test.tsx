import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getEventShareCardMedia: vi.fn(),
}));

vi.mock("@/lib/event-settings.service", () => ({
  getEventShareCardMedia: mocks.getEventShareCardMedia,
}));

import OpenGraphImage, { contentType, size } from "../opengraph-image";

describe("OpenGraphImage", () => {
  it("returns a branded 1200 by 630 PNG when settings are absent", async () => {
    mocks.getEventShareCardMedia.mockResolvedValue(null);

    const response = await OpenGraphImage();

    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
  });

  it("accepts uploaded logo bytes without fetching through HTTP", async () => {
    mocks.getEventShareCardMedia.mockResolvedValue({
      title: "Baithani Night",
      description: "Door prize draw",
      accentColor: "#d076b4",
      logoAlt: "Baithani logo",
      logoBytes: new Uint8Array([137, 80, 78, 71]),
      logoMime: "image/png",
    });

    const response = await OpenGraphImage();

    expect(response.status).toBe(200);
    expect(mocks.getEventShareCardMedia).toHaveBeenCalled();
  });
});
