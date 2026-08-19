"use server";

import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/features/admin-auth/server/admin-session.service";
import { writeAdminAuditLog } from "@/features/audit-log/server/audit-log.service";
import { getSafeCurrentRequestContext } from "@/shared/request-context/current-request-context.server";

import type { EventSettingsActionState } from "./event-settings-action.type";
import { saveEventSettings } from "./server/event-settings.command";
import { parseEventSettingsFormData } from "./server/event-settings-request";

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
    return { status: "error", error: "Not authorized." };
  }

  const parsed = await parseEventSettingsFormData(formData);
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
    return { status: "error", fieldErrors: parsed.fieldErrors };
  }

  const result = await saveEventSettings(parsed.input, {
    actor: "admin",
    request: await getSafeCurrentRequestContext(),
  });
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
      status: "error",
      error: result.error,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { status: "success", settings: result.settings };
}
