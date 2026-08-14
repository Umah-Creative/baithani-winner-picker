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
    operators: {
      and: vi.fn((...conditions: unknown[]) => ({
        type: "and",
        conditions,
      })),
      count: vi.fn(() => ({ type: "count" })),
      desc: vi.fn((column: unknown) => ({ type: "desc", column })),
      eq: vi.fn((column: unknown, value: unknown) => ({
        type: "eq",
        column,
        value,
      })),
      gte: vi.fn((column: unknown, value: unknown) => ({
        type: "gte",
        column,
        value,
      })),
      ilike: vi.fn((column: unknown, value: unknown) => ({
        type: "ilike",
        column,
        value,
      })),
      lt: vi.fn((column: unknown, value: unknown) => ({
        type: "lt",
        column,
        value,
      })),
    },
  };
});

vi.mock("@/db/client", () => ({ db: { select: mocks.select } }));
vi.mock("server-only", () => ({}));
vi.mock("drizzle-orm", () => mocks.operators);

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
    const countConditions = mocks.countQuery.where.mock.calls[0]?.[0] as {
      conditions: Array<{ type: string; value: unknown }>;
    };
    const rowConditions = mocks.rowsQuery.where.mock.calls[0]?.[0];
    expect(countConditions.conditions).toEqual([
      expect.objectContaining({ type: "eq", value: "settings.update" }),
      expect.objectContaining({ type: "eq", value: "success" }),
      expect.objectContaining({ type: "gte" }),
      expect.objectContaining({ type: "lt" }),
      expect.objectContaining({ type: "ilike", value: "%203.0.113.8%" }),
      expect.objectContaining({ type: "ilike", value: "%req-123%" }),
    ]);
    expect(countConditions.conditions[2]?.value).toEqual(
      new Date("2026-08-01T00:00:00.000Z")
    );
    expect(countConditions.conditions[3]?.value).toEqual(
      new Date("2026-08-15T00:00:00.000Z")
    );
    expect(rowConditions).toBe(countConditions);
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
