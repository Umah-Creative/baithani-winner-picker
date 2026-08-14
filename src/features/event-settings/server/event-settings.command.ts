import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { adminAuditLogs, eventSettings } from "@/db/schema";

import {
  ACCEPTED_LOGO_MIME_TYPES,
  ACTIVE_EVENT_SETTINGS_ID,
  MAX_EVENT_RANGE,
  MAX_LOGO_BYTES,
  MIN_EVENT_RANGE,
} from "../event-settings.constant";
import type { EventSettingsFieldError } from "../event-settings.type";
import { validateExcludedNumbers } from "../event-settings.validation";
import {
  buildEventSettingsAuditEvents,
  resolveLogoChange,
  toEventSettingsAuditSnapshot,
} from "./event-settings-audit";
import type {
  EventSettingsAuditContext,
  EventSettingsPersistenceInput,
  EventSettingsSaveResult,
} from "./event-settings-persistence.type";
import { toEventSettingsView } from "./event-settings-projection";

const allowedLogoTypes = new Set<string>(ACCEPTED_LOGO_MIME_TYPES);

export function validateEventSettingsPersistenceInput(
  input: EventSettingsPersistenceInput
): EventSettingsFieldError {
  const fieldErrors: EventSettingsFieldError = {};
  const isRangeValid =
    Number.isInteger(input.minRange) &&
    Number.isInteger(input.maxRange) &&
    input.minRange >= MIN_EVENT_RANGE &&
    input.maxRange <= MAX_EVENT_RANGE &&
    input.minRange < input.maxRange;

  if (!input.title) fieldErrors.title = "Title is required.";
  if (!/^#[0-9a-fA-F]{6}$/.test(input.accentColor)) {
    fieldErrors.accentColor =
      "Accent color must be a 6-digit hex value like #d076b4.";
  }
  if (!isRangeValid) {
    fieldErrors.minRange =
      "Min must be a whole number from 1 to 9,999 and lower than max.";
    fieldErrors.maxRange =
      "Max must be a whole number from 2 to 10,000 and greater than min.";
  } else {
    const excludedError = validateExcludedNumbers(
      input.excludedNumbers,
      input.minRange,
      input.maxRange
    );
    if (excludedError) fieldErrors.excludedNumbers = excludedError;
  }
  if (input.logoBytes && !input.logoMime) {
    fieldErrors.logo = "Logo file must have a valid image type.";
  } else if (input.logoMime && !allowedLogoTypes.has(input.logoMime)) {
    fieldErrors.logo = "Logo must be PNG, JPEG, WebP, or GIF.";
  } else if (input.logoBytes && input.logoBytes.byteLength > MAX_LOGO_BYTES) {
    fieldErrors.logo = "Logo must be smaller than 5 MB.";
  }
  return fieldErrors;
}

export async function saveEventSettings(
  input: EventSettingsPersistenceInput,
  auditContext: EventSettingsAuditContext
): Promise<EventSettingsSaveResult> {
  const fieldErrors = validateEventSettingsPersistenceInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    const settings = await db.transaction(async (transaction) => {
      const [previous] = await transaction
        .select()
        .from(eventSettings)
        .where(eq(eventSettings.id, ACTIVE_EVENT_SETTINGS_ID))
        .limit(1);
      const logoChange = resolveLogoChange({
        hasExistingLogo: Boolean(previous?.logoBytes),
        hasReplacementLogo: Boolean(input.logoBytes),
        removeLogo: input.removeLogo,
      });
      const occurredAt = new Date();
      const baseValues = {
        title: input.title,
        description: input.description,
        accentColor: input.accentColor,
        minRange: input.minRange,
        maxRange: input.maxRange,
        excludedNumbers: input.excludedNumbers,
        logoAlt: input.logoAlt,
        updatedAt: occurredAt,
      };
      const values =
        logoChange === "remove"
          ? { ...baseValues, logoBytes: null, logoMime: null }
          : logoChange === "replace"
            ? {
                ...baseValues,
                logoBytes: input.logoBytes,
                logoMime: input.logoMime,
              }
            : baseValues;
      const [committed] = await transaction
        .insert(eventSettings)
        .values({ id: ACTIVE_EVENT_SETTINGS_ID, ...values })
        .onConflictDoUpdate({
          target: eventSettings.id,
          set: values,
        })
        .returning();

      if (!committed) throw new Error("Settings upsert returned no row.");

      const before = previous ? toEventSettingsAuditSnapshot(previous) : null;
      const after = toEventSettingsAuditSnapshot(committed);
      const events = buildEventSettingsAuditEvents({
        context: auditContext,
        before,
        after,
        logoChange,
        occurredAt,
      });
      await transaction.insert(adminAuditLogs).values(events);
      return toEventSettingsView(committed);
    });

    return { ok: true, settings };
  } catch {
    console.error("Event settings transaction failed.");
    return { ok: false, error: "Could not save settings." };
  }
}
