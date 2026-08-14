"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
} from "@/lib/auth.service";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { getAdminAuditRequestMetadata } from "@/lib/admin-audit.shared";
import {
  clearLoginFailures,
  consumeLoginFailure,
  getLoginRateLimitKey,
} from "@/lib/admin-login-rate-limit";
import { saveEventSettings } from "@/lib/event-settings.mutate";
import { parseExcludedNumbers } from "@/lib/event-settings.validation";
import type {
  EventSettingsFieldError,
  EventSettingsInput,
} from "@/lib/event-settings.type";

export type ActionState = {
  error?: string;
  fieldErrors?: EventSettingsFieldError;
  success?: boolean;
};

async function recordAdminAudit(
  input: Parameters<typeof writeAdminAuditLog>[0]
): Promise<void> {
  await writeAdminAuditLog(input);
}

async function getLoginRateLimitKeyForRequest(): Promise<string> {
  try {
    const requestHeaders = await headers();
    return getLoginRateLimitKey(getAdminAuditRequestMetadata(requestHeaders));
  } catch {
    return "anonymous";
  }
}

export async function loginAdmin(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  const rateLimitKey = await getLoginRateLimitKeyForRequest();

  if (!expected || password !== expected) {
    if (consumeLoginFailure(rateLimitKey)) {
      return { error: "Invalid password." };
    }
    await recordAdminAudit({
      action: "auth.login",
      outcome: "failure",
      actor: "admin",
      metadata: { reason: "invalid_credentials" },
    });
    return { error: "Invalid password." };
  }

  clearLoginFailures(rateLimitKey);
  await createAdminSession();
  await recordAdminAudit({
    action: "auth.login",
    outcome: "success",
    actor: "admin",
  });
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  await recordAdminAudit({
    action: "auth.logout",
    outcome: "success",
    actor: "admin",
  });
  redirect("/admin/login");
}

async function parseFormData(
  formData: FormData
): Promise<
  | { ok: true; input: EventSettingsInput }
  | { ok: false; fieldErrors: EventSettingsFieldError }
> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const accentColor = String(formData.get("accentColor") ?? "#d076b4").trim();
  const minRange = Number(formData.get("minRange"));
  const maxRange = Number(formData.get("maxRange"));
  const logoAlt = String(formData.get("logoAlt") ?? "").trim();
  const excludedRaw = String(formData.get("excludedNumbers") ?? "");

  const excludedNumbersResult = parseExcludedNumbers(
    excludedRaw,
    minRange,
    maxRange
  );

  if (!excludedNumbersResult.ok) {
    return {
      ok: false,
      fieldErrors: { excludedNumbers: excludedNumbersResult.error },
    };
  }

  const logo = formData.get("logo");
  const logoBytes =
    logo instanceof File && logo.size > 0
      ? Buffer.from(await logo.arrayBuffer())
      : null;
  const logoMime = logo instanceof File && logo.size > 0 ? logo.type : null;
  const removeLogo = formData.get("removeLogo") === "on";

  return {
    ok: true,
    input: {
      title,
      description,
      accentColor,
      minRange,
      maxRange,
      excludedNumbers: excludedNumbersResult.values,
      logoAlt,
      logoBytes,
      logoMime,
      removeLogo,
    },
  };
}

export async function updateEventSettings(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAdminAuthenticated())) {
    await recordAdminAudit({
      action: "settings.update_failed",
      outcome: "denied",
      actor: "admin",
      metadata: { reason: "not_authenticated" },
    });
    return { error: "Not authorized." };
  }

  const parsed = await parseFormData(formData);
  if (!parsed.ok) {
    await recordAdminAudit({
      action: "settings.update_failed",
      outcome: "failure",
      actor: "admin",
      metadata: {
        reason: "validation",
        fields: Object.keys(parsed.fieldErrors),
      },
    });
    return { fieldErrors: parsed.fieldErrors };
  }

  const result = await saveEventSettings(parsed.input);

  if (!result.ok) {
    await recordAdminAudit({
      action: "settings.update_failed",
      outcome: "failure",
      actor: "admin",
      metadata: {
        reason: result.error ? "persistence" : "validation",
        fields: Object.keys(result.fieldErrors ?? {}),
      },
    });
    return {
      error: result.error,
      fieldErrors: result.fieldErrors,
    };
  }

  await recordAdminAudit({
    action: "settings.update",
    outcome: "success",
    actor: "admin",
    metadata: result.audit
      ? { before: result.audit.before, after: result.audit.after }
      : {},
  });

  if (result.audit?.logoChange === "replace") {
    await recordAdminAudit({
      action: "logo.replace",
      outcome: "success",
      actor: "admin",
      metadata: { before: result.audit.before, after: result.audit.after },
    });
  } else if (result.audit?.logoChange === "remove") {
    await recordAdminAudit({
      action: "logo.remove",
      outcome: "success",
      actor: "admin",
      metadata: { before: result.audit.before, after: result.audit.after },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}
