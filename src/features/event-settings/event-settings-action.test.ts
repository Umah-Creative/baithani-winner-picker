import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticated: vi.fn(),
  audit: vi.fn(),
  request: vi.fn(),
  parse: vi.fn(),
  save: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/features/admin-auth/server/admin-session.service", () => ({
  isAdminAuthenticated: mocks.authenticated,
}));
vi.mock("@/features/audit-log/server/audit-log.service", () => ({
  writeAdminAuditLog: mocks.audit,
}));
vi.mock("@/shared/request-context/current-request-context.server", () => ({
  getSafeCurrentRequestContext: mocks.request,
}));
vi.mock("./server/event-settings-request", () => ({
  parseEventSettingsFormData: mocks.parse,
}));
vi.mock("./server/event-settings.command", () => ({
  saveEventSettings: mocks.save,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { updateEventSettings } from "./event-settings.action";

const input = {
  title: "Baithani Night",
  description: "Door prize draw",
  accentColor: "#d076b4",
  minRange: 1,
  maxRange: 100,
  excludedNumbers: [4],
  logoAlt: "Baithani mark",
  logoBytes: null,
  logoMime: null,
  removeLogo: false,
};
const canonicalSettings = {
  title: input.title,
  description: input.description,
  accentColor: input.accentColor,
  hasLogo: false,
  logoAlt: input.logoAlt,
  minRange: input.minRange,
  maxRange: input.maxRange,
  excludedNumbers: input.excludedNumbers,
  updatedAt: "2026-08-15T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.audit.mockResolvedValue(undefined);
  mocks.request.mockResolvedValue({
    ipAddress: null,
    userAgent: null,
    acceptLanguage: null,
    requestId: "req-settings",
  });
  mocks.parse.mockResolvedValue({ ok: true, input });
});

describe("updateEventSettings", () => {
  it("rejects unauthenticated writes before parsing transport", async () => {
    mocks.authenticated.mockResolvedValue(false);

    await expect(
      updateEventSettings({ status: "idle" }, new FormData())
    ).resolves.toEqual({ status: "error", error: "Not authorized." });
    expect(mocks.parse).not.toHaveBeenCalled();
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "settings.update_failed",
        outcome: "denied",
      })
    );
  });

  it("returns parser validation errors without calling persistence", async () => {
    mocks.authenticated.mockResolvedValue(true);
    mocks.parse.mockResolvedValue({
      ok: false,
      fieldErrors: { excludedNumbers: "Invalid exclusions." },
    });

    await expect(
      updateEventSettings({ status: "idle" }, new FormData())
    ).resolves.toEqual({
      status: "error",
      fieldErrors: { excludedNumbers: "Invalid exclusions." },
    });
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("returns the canonical committed settings projection", async () => {
    mocks.authenticated.mockResolvedValue(true);
    mocks.save.mockResolvedValue({ ok: true, settings: canonicalSettings });

    await expect(
      updateEventSettings({ status: "idle" }, new FormData())
    ).resolves.toEqual({ status: "success", settings: canonicalSettings });
    expect(mocks.save).toHaveBeenCalledWith(
      input,
      expect.objectContaining({
        actor: "admin",
        request: expect.objectContaining({ requestId: "req-settings" }),
      })
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin");
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it("returns the safe persistence error and records failure best-effort", async () => {
    mocks.authenticated.mockResolvedValue(true);
    mocks.save.mockResolvedValue({
      ok: false,
      error: "Could not save settings.",
    });

    await expect(
      updateEventSettings({ status: "idle" }, new FormData())
    ).resolves.toEqual({
      status: "error",
      error: "Could not save settings.",
    });
    expect(mocks.audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "settings.update_failed",
        outcome: "failure",
        metadata: { reason: "persistence", fields: [] },
      })
    );
  });
});
