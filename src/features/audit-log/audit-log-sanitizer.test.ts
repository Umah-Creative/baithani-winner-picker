import { describe, expect, it } from "vitest";

import { sanitizeAuditMetadata } from "./audit-log-sanitizer";

describe("sanitizeAuditMetadata", () => {
  it("redacts credentials and drops unsafe request and logo fields", () => {
    expect(
      sanitizeAuditMetadata({
        before: { title: "Old title", logoBytes: Buffer.from("logo") },
        password: "never-store-this",
        cookie: "session=secret",
        rawBody: "unsafe",
        headers: { authorization: "Bearer secret" },
        after: { title: "New title", logoMime: "image/png" },
      })
    ).toEqual({
      before: { title: "Old title" },
      after: { title: "New title", logoMime: "image/png" },
    });
  });
});
