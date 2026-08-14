import "server-only";

import type { AdminAuditRequestMetadata } from "@/features/audit-log/audit-log.type";

const LOGIN_FAILURE_WINDOW_MS = 10 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;
const MAX_TRACKED_LOGIN_KEYS = 10_000;

type LoginFailureWindow = {
  count: number;
  expiresAt: number;
};

const loginFailures = new Map<string, LoginFailureWindow>();

function pruneExpiredLoginFailures(now: number): void {
  for (const [key, window] of loginFailures) {
    if (window.expiresAt <= now) loginFailures.delete(key);
  }

  while (loginFailures.size >= MAX_TRACKED_LOGIN_KEYS) {
    const oldestKey = loginFailures.keys().next().value;
    if (!oldestKey) return;
    loginFailures.delete(oldestKey);
  }
}

export function getLoginRateLimitKey(
  request: AdminAuditRequestMetadata
): string {
  return request.ipAddress ? `ip:${request.ipAddress}` : "anonymous";
}

export function consumeLoginFailure(key: string, now = Date.now()): boolean {
  pruneExpiredLoginFailures(now);
  const window = loginFailures.get(key);

  if (!window) {
    loginFailures.set(key, {
      count: 1,
      expiresAt: now + LOGIN_FAILURE_WINDOW_MS,
    });
    return false;
  }

  if (window.count >= MAX_LOGIN_FAILURES) return true;

  window.count += 1;
  return false;
}

export function clearLoginFailures(key: string): void {
  loginFailures.delete(key);
}

export function resetLoginRateLimits(): void {
  loginFailures.clear();
}
