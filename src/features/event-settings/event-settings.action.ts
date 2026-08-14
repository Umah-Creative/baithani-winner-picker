"use server";

import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/features/admin-auth/server/admin-session.service";
import { writeAdminAuditLog } from "@/features/audit-log/server/audit-log.service";

import { parseExcludedNumbers } from "./event-settings.validation";
import { saveEventSettings } from "./server/event-settings.command";
import type { EventSettingsActionState } from "./event-settings-action.type";
import type {
  EventSettingsFieldError,
  EventSettingsInput,
} from "./event-settings.type";

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
  _state: EventSettingsActionState,
  formData: FormData
): Promise<EventSettingsActionState> {
  if (!(await isAdminAuthenticated())) {
    await writeAdminAuditLog({
      action: "settings.update_failed",
      outcome: "denied",
      actor: "admin",
      metadata: { reason: "not_authenticated" },
    });
    return { error: "Not authorized." };
  }

  const parsed = await parseFormData(formData);
  if (!parsed.ok) {
    await writeAdminAuditLog({
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
    await writeAdminAuditLog({
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

  await writeAdminAuditLog({
    action: "settings.update",
    outcome: "success",
    actor: "admin",
    metadata: result.audit
      ? { before: result.audit.before, after: result.audit.after }
      : {},
  });

  if (result.audit?.logoChange === "replace") {
    await writeAdminAuditLog({
      action: "logo.replace",
      outcome: "success",
      actor: "admin",
      metadata: { before: result.audit.before, after: result.audit.after },
    });
  } else if (result.audit?.logoChange === "remove") {
    await writeAdminAuditLog({
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
