"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { writeAdminAuditLog } from "@/features/audit-log/server/audit-log.service";
import { getAdminAuditRequestMetadata } from "@/features/audit-log/server/audit-request";
import {
  clearAdminSession,
  createAdminSession,
} from "@/features/admin-auth/server/admin-session.service";
import {
  clearLoginFailures,
  consumeLoginFailure,
  getLoginRateLimitKey,
} from "@/features/admin-auth/server/admin-login-rate-limit";

import type { LoginActionState } from "./admin-auth.type";

async function getLoginRateLimitKeyForRequest(): Promise<string> {
  try {
    const requestHeaders = await headers();
    return getLoginRateLimitKey(getAdminAuditRequestMetadata(requestHeaders));
  } catch {
    return "anonymous";
  }
}

export async function loginAdmin(
  _state: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  const rateLimitKey = await getLoginRateLimitKeyForRequest();

  if (!expected || password !== expected) {
    if (consumeLoginFailure(rateLimitKey)) {
      return { status: "error", error: "Invalid password." };
    }
    await writeAdminAuditLog({
      action: "auth.login",
      outcome: "failure",
      actor: "admin",
      metadata: { reason: "invalid_credentials" },
    });
    return { status: "error", error: "Invalid password." };
  }

  clearLoginFailures(rateLimitKey);
  await createAdminSession();
  await writeAdminAuditLog({
    action: "auth.login",
    outcome: "success",
    actor: "admin",
  });
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  await writeAdminAuditLog({
    action: "auth.logout",
    outcome: "success",
    actor: "admin",
  });
  redirect("/admin/login");
}
