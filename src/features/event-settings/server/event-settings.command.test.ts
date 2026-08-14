import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const eventSettings = { id: "event-settings-id" };
  const adminAuditLogs = { id: "admin-audit-log-id" };
  const selectQuery = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  };
  const settingsInsert = {
    values: vi.fn(),
    onConflictDoUpdate: vi.fn(),
    returning: vi.fn(),
  };
  const auditInsert = { values: vi.fn() };
  const transactionClient = {
    select: vi.fn(),
    insert: vi.fn(),
  };
  const transaction = vi.fn(
    async (callback: (client: typeof transactionClient) => unknown) =>
      callback(transactionClient)
  );

  return {
    eventSettings,
    adminAuditLogs,
    selectQuery,
    settingsInsert,
    auditInsert,
    transactionClient,
    transaction,
    eq: vi.fn(),
  };
});

vi.mock("@/db/client", () => ({ db: { transaction: mocks.transaction } }));
vi.mock("@/db/schema", () => ({
  eventSettings: mocks.eventSettings,
  adminAuditLogs: mocks.adminAuditLogs,
}));
vi.mock("drizzle-orm", () => ({ eq: mocks.eq }));

import { saveEventSettings } from "./event-settings.command";

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
const auditContext = {
  actor: "admin",
  request: {
    ipAddress: "203.0.113.8",
    userAgent: "Vitest",
    acceptLanguage: "en",
    requestId: "req-settings",
  },
};

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    title: input.title,
    description: input.description,
    accentColor: input.accentColor,
    logoBytes: null,
    logoMime: null,
    logoAlt: input.logoAlt,
    minRange: input.minRange,
    maxRange: input.maxRange,
    excludedNumbers: input.excludedNumbers,
    updatedAt: new Date("2026-08-15T00:00:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectQuery.from.mockReturnValue(mocks.selectQuery);
  mocks.selectQuery.where.mockReturnValue(mocks.selectQuery);
  mocks.selectQuery.limit.mockResolvedValue([]);
  mocks.settingsInsert.values.mockReturnValue(mocks.settingsInsert);
  mocks.settingsInsert.onConflictDoUpdate.mockReturnValue(mocks.settingsInsert);
  mocks.settingsInsert.returning.mockResolvedValue([row()]);
  mocks.auditInsert.values.mockResolvedValue(undefined);
  mocks.transactionClient.select.mockReturnValue(mocks.selectQuery);
  mocks.transactionClient.insert.mockImplementation((table: unknown) =>
    table === mocks.eventSettings ? mocks.settingsInsert : mocks.auditInsert
  );
});

describe("saveEventSettings", () => {
  it("commits settings and their success audit in one transaction", async () => {
    await expect(saveEventSettings(input, auditContext)).resolves.toEqual({
      ok: true,
      settings: {
        title: input.title,
        description: input.description,
        accentColor: input.accentColor,
        hasLogo: false,
        logoAlt: input.logoAlt,
        minRange: input.minRange,
        maxRange: input.maxRange,
        excludedNumbers: input.excludedNumbers,
        updatedAt: "2026-08-15T00:00:00.000Z",
      },
    });
    expect(mocks.transaction).toHaveBeenCalledOnce();
    const events = mocks.auditInsert.values.mock.calls[0]?.[0];
    expect(events).toEqual([
      expect.objectContaining({
        action: "settings.update",
        outcome: "success",
        requestId: "req-settings",
      }),
    ]);
  });

  it("gives a replacement logo precedence over removal intent", async () => {
    mocks.selectQuery.limit.mockResolvedValue([
      row({ logoBytes: Buffer.from("old"), logoMime: "image/png" }),
    ]);
    mocks.settingsInsert.returning.mockResolvedValue([
      row({ logoBytes: Buffer.from("new"), logoMime: "image/webp" }),
    ]);

    await saveEventSettings(
      {
        ...input,
        logoBytes: Buffer.from("new"),
        logoMime: "image/webp",
        removeLogo: true,
      },
      auditContext
    );

    expect(mocks.settingsInsert.values).toHaveBeenCalledWith(
      expect.objectContaining({
        logoBytes: Buffer.from("new"),
        logoMime: "image/webp",
      })
    );
    expect(mocks.auditInsert.values.mock.calls[0]?.[0]).toEqual([
      expect.objectContaining({ action: "settings.update" }),
      expect.objectContaining({ action: "logo.replace" }),
    ]);
  });

  it("removes an existing logo when no replacement exists", async () => {
    mocks.selectQuery.limit.mockResolvedValue([
      row({ logoBytes: Buffer.from("old"), logoMime: "image/png" }),
    ]);
    mocks.settingsInsert.returning.mockResolvedValue([row()]);

    await saveEventSettings({ ...input, removeLogo: true }, auditContext);

    expect(mocks.settingsInsert.values).toHaveBeenCalledWith(
      expect.objectContaining({ logoBytes: null, logoMime: null })
    );
    expect(mocks.auditInsert.values.mock.calls[0]?.[0]).toEqual([
      expect.objectContaining({ action: "settings.update" }),
      expect.objectContaining({ action: "logo.remove" }),
    ]);
  });

  it("returns a safe failure when an audit insert aborts the transaction", async () => {
    const error = new Error("database audit failure with secret internals");
    mocks.auditInsert.values.mockRejectedValue(error);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(saveEventSettings(input, auditContext)).resolves.toEqual({
      ok: false,
      error: "Could not save settings.",
    });
    expect(mocks.auditInsert.values).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(
      "Event settings transaction failed."
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "secret internals"
    );
    consoleError.mockRestore();
  });

  it("rejects invalid domain input before opening a transaction", async () => {
    await expect(
      saveEventSettings({ ...input, title: "" }, auditContext)
    ).resolves.toEqual({
      ok: false,
      fieldErrors: { title: "Title is required." },
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
