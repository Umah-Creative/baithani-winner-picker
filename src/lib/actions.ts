"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
} from "@/lib/auth.service";
import { writeCurrentAdminAuditLog } from "@/lib/admin-audit";
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

function recordAdminAudit(
  input: Parameters<typeof writeCurrentAdminAuditLog>[0]
): void {
  void writeCurrentAdminAuditLog(input);
}

export async function loginAdmin(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    recordAdminAudit({
      action: "auth.login",
      outcome: "failure",
      actor: "admin",
      metadata: { reason: "invalid_credentials" },
    });
    return { error: "Invalid password." };
  }

  await createAdminSession();
  recordAdminAudit({
    action: "auth.login",
    outcome: "success",
    actor: "admin",
  });
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  recordAdminAudit({
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
    recordAdminAudit({
      action: "settings.update_failed",
      outcome: "denied",
      actor: "admin",
      metadata: { reason: "not_authenticated" },
    });
    return { error: "Not authorized." };
  }

  const parsed = await parseFormData(formData);
  if (!parsed.ok) {
    recordAdminAudit({
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
    recordAdminAudit({
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

  recordAdminAudit({
    action: "settings.update",
    outcome: "success",
    actor: "admin",
    metadata: result.audit
      ? { before: result.audit.before, after: result.audit.after }
      : {},
  });

  if (result.audit?.logoChange === "replace") {
    recordAdminAudit({
      action: "logo.replace",
      outcome: "success",
      actor: "admin",
      metadata: { before: result.audit.before, after: result.audit.after },
    });
  } else if (result.audit?.logoChange === "remove") {
    recordAdminAudit({
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
