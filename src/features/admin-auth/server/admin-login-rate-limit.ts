import "server-only";

const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;
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
}

function makeRoomForLoginKey(): void {
  while (loginFailures.size >= MAX_TRACKED_LOGIN_KEYS) {
    const oldestKey = loginFailures.keys().next().value;
    if (!oldestKey) return;
    loginFailures.delete(oldestKey);
  }
}

export function getLoginRateLimitKey(ipAddress: string | null): string {
  return ipAddress ? `ip:${ipAddress}` : "anonymous";
}

export function checkLoginRateLimit(
  key: string,
  now = Date.now()
): { blocked: boolean } {
  pruneExpiredLoginFailures(now);
  const window = loginFailures.get(key);

  return { blocked: Boolean(window && window.count >= MAX_LOGIN_FAILURES) };
}

export function recordLoginFailure(
  key: string,
  now = Date.now()
): { lockoutStarted: boolean } {
  pruneExpiredLoginFailures(now);
  const window = loginFailures.get(key);

  if (!window) {
    makeRoomForLoginKey();
    loginFailures.set(key, {
      count: 1,
      expiresAt: now + LOGIN_FAILURE_WINDOW_MS,
    });
    return { lockoutStarted: false };
  }

  if (window.count >= MAX_LOGIN_FAILURES) {
    return { lockoutStarted: false };
  }

  window.count += 1;
  return { lockoutStarted: window.count === MAX_LOGIN_FAILURES };
}

export function clearLoginFailures(key: string): void {
  loginFailures.delete(key);
}

export function resetLoginRateLimits(): void {
  loginFailures.clear();
}
