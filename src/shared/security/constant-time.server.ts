import "server-only";

import { timingSafeEqual } from "node:crypto";

export function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left, "utf8");
  const rightBytes = Buffer.from(right, "utf8");
  const comparisonLength = Math.max(leftBytes.length, rightBytes.length, 1);
  const paddedLeft = Buffer.alloc(comparisonLength);
  const paddedRight = Buffer.alloc(comparisonLength);

  leftBytes.copy(paddedLeft);
  rightBytes.copy(paddedRight);

  return (
    timingSafeEqual(paddedLeft, paddedRight) &&
    leftBytes.length === rightBytes.length
  );
}
