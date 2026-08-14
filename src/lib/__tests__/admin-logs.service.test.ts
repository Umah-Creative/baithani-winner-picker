import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const countQuery = {
    from: vi.fn(),
    where: vi.fn(),
  };
  const rowsQuery = {
    from: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn(),
  };

  countQuery.from.mockReturnValue(countQuery);
  countQuery.where.mockResolvedValue([{ total: 51 }]);
  rowsQuery.from.mockReturnValue(rowsQuery);
  rowsQuery.where.mockReturnValue(rowsQuery);
  rowsQuery.orderBy.mockReturnValue(rowsQuery);
  rowsQuery.limit.mockReturnValue(rowsQuery);
  rowsQuery.offset.mockResolvedValue([
    {
      id: 51,
      action: "settings.update",
      outcome: "success",
      actor: "admin",
      occurredAt: new Date("2026-08-14T12:00:00.000Z"),
      ipAddress: "203.0.113.8",
      requestId: "req-123",
      metadata: { before: { title: "Old" }, after: { title: "New" } },
    },
  ]);

  return {
    countQuery,
    rowsQuery,
    select: vi.fn((selection?: unknown) =>
      selection ? countQuery : rowsQuery
    ),
  };
});

vi.mock("@/db/client", () => ({ db: { select: mocks.select } }));
vi.mock("server-only", () => ({}));

import { getAdminAuditLogPage } from "../admin-logs.service";

describe("getAdminAuditLogPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.countQuery.from.mockReturnValue(mocks.countQuery);
    mocks.countQuery.where.mockResolvedValue([{ total: 51 }]);
    mocks.rowsQuery.from.mockReturnValue(mocks.rowsQuery);
    mocks.rowsQuery.where.mockReturnValue(mocks.rowsQuery);
    mocks.rowsQuery.orderBy.mockReturnValue(mocks.rowsQuery);
    mocks.rowsQuery.limit.mockReturnValue(mocks.rowsQuery);
    mocks.rowsQuery.offset.mockResolvedValue([
      {
        id: 51,
        action: "settings.update",
        outcome: "success",
        actor: "admin",
        occurredAt: new Date("2026-08-14T12:00:00.000Z"),
        ipAddress: "203.0.113.8",
        requestId: "req-123",
        metadata: {
          before: { title: "Old" },
          after: { title: "New" },
        },
      },
    ]);
  });

  it("queries filtered audit events in fixed 50-row pages", async () => {
    const page = await getAdminAuditLogPage({
      action: "settings.update",
      outcome: "success",
      from: "2026-08-01",
      to: "2026-08-14",
      ip: "203.0.113.8",
      requestId: "req-123",
      page: "2",
    });

    expect(page.filters).toMatchObject({
      action: "settings.update",
      outcome: "success",
      from: "2026-08-01",
      to: "2026-08-14",
      ip: "203.0.113.8",
      requestId: "req-123",
      page: 2,
      limit: 50,
      offset: 50,
    });
    expect(mocks.rowsQuery.limit).toHaveBeenCalledWith(50);
    expect(mocks.rowsQuery.offset).toHaveBeenCalledWith(50);
    expect(page.rows).toHaveLength(1);
    expect(page.rows[0]?.metadata).toEqual({
      before: { title: "Old" },
      after: { title: "New" },
    });
  });

  it("clamps oversized page requests after counting filtered events", async () => {
    const page = await getAdminAuditLogPage({ page: "999999" });

    expect(page.filters).toMatchObject({ page: 2, offset: 50 });
    expect(mocks.rowsQuery.limit).toHaveBeenCalledWith(50);
    expect(mocks.rowsQuery.offset).toHaveBeenCalledWith(50);
  });
});
