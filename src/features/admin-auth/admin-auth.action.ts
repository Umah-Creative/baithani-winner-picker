"use server";

import { redirect } from "next/navigation";

import { writeAdminAuditLog } from "@/features/audit-log/server/audit-log.service";
import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
} from "@/features/admin-auth/server/admin-session.service";
import {
  checkLoginRateLimit,
  clearLoginFailures,
  getLoginRateLimitKey,
  recordLoginFailure,
} from "@/features/admin-auth/server/admin-login-rate-limit";
import { getSafeCurrentRequestContext } from "@/shared/request-context/current-request-context";
import { constantTimeEqual } from "@/shared/security/constant-time";

import type { LoginActionState } from "./admin-auth.type";

async function getLoginRateLimitKeyForRequest(): Promise<string> {
  const request = await getSafeCurrentRequestContext();
  return getLoginRateLimitKey(request.ipAddress);
}

export async function loginAdmin(
  _state: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  const rateLimitKey = await getLoginRateLimitKeyForRequest();

  if (!expected) {
    console.error("Admin login configuration is incomplete.");
    return {
      status: "error",
      reason: "configuration",
      error: "Admin login is unavailable.",
    };
  }

  if (checkLoginRateLimit(rateLimitKey).blocked) {
    return {
      status: "error",
      reason: "rate_limited",
      error: "Too many login attempts. Try again later.",
    };
  }

  if (password.length > 1_024 || !constantTimeEqual(password, expected)) {
    const { lockoutStarted } = recordLoginFailure(rateLimitKey);
    await writeAdminAuditLog({
      action: "auth.login",
      outcome: lockoutStarted ? "denied" : "failure",
      actor: "admin",
      metadata: {
        reason: lockoutStarted ? "rate_limited" : "invalid_credentials",
      },
    });
    return {
      status: "error",
      reason: lockoutStarted ? "rate_limited" : "invalid_credentials",
      error: lockoutStarted
        ? "Too many login attempts. Try again later."
        : "Invalid password.",
    };
  }

  clearLoginFailures(rateLimitKey);
  try {
    await createAdminSession();
  } catch {
    console.error("Admin session configuration is invalid.");
    return {
      status: "error",
      reason: "configuration",
      error: "Admin login is unavailable.",
    };
  }
  await writeAdminAuditLog({
    action: "auth.login",
    outcome: "success",
    actor: "admin",
  });
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  const authenticated = await isAdminAuthenticated();
  await clearAdminSession();
  if (authenticated) {
    await writeAdminAuditLog({
      action: "auth.logout",
      outcome: "success",
      actor: "admin",
    });
  }
  redirect("/admin/login");
}
