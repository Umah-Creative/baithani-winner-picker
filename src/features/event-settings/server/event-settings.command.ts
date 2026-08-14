import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { eventSettings } from "@/db/schema";
import { resolveLogoChange } from "@/features/audit-log/audit-log.shared";
import { validateExcludedNumbers } from "@/features/event-settings/event-settings.validation";
import type {
  EventSettingsAuditSnapshot,
  EventSettingsFieldError,
  EventSettingsInput,
  EventSettingsSaveResult,
} from "@/features/event-settings/event-settings.type";

const ACTIVE_ID = 1;
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const MIN_RANGE = 1;
const MAX_RANGE = 10_000;
const ALLOWED_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

function validate(input: EventSettingsInput): EventSettingsFieldError {
  const fieldErrors: EventSettingsFieldError = {};
  const isRangeValid =
    Number.isInteger(input.minRange) &&
    Number.isInteger(input.maxRange) &&
    input.minRange >= MIN_RANGE &&
    input.maxRange <= MAX_RANGE &&
    input.minRange < input.maxRange;

  if (!input.title) {
    fieldErrors.title = "Title is required.";
  }

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
    const excludedNumbersError = validateExcludedNumbers(
      input.excludedNumbers,
      input.minRange,
      input.maxRange
    );
    if (excludedNumbersError) {
      fieldErrors.excludedNumbers = excludedNumbersError;
    }
  }

  if (input.logoBytes && !input.logoMime) {
    fieldErrors.logo = "Logo file must have a valid image type.";
  } else if (input.logoMime && !ALLOWED_LOGO_TYPES.has(input.logoMime)) {
    fieldErrors.logo = "Logo must be PNG, JPEG, WebP, or GIF.";
  } else if (input.logoBytes && input.logoBytes.byteLength > MAX_LOGO_BYTES) {
    fieldErrors.logo = "Logo must be smaller than 5 MB.";
  }

  return fieldErrors;
}

function toAuditSnapshot(input: {
  title: string;
  description: string;
  accentColor: string;
  logoBytes: Buffer | null;
  logoMime: string | null;
  logoAlt: string | null;
  minRange: number;
  maxRange: number;
  excludedNumbers: number[];
}): EventSettingsAuditSnapshot {
  return {
    title: input.title,
    description: input.description,
    accentColor: input.accentColor,
    hasLogo: Boolean(input.logoBytes),
    logoMime: input.logoMime,
    logoAlt: input.logoAlt ?? input.title,
    minRange: input.minRange,
    maxRange: input.maxRange,
    excludedNumbers: input.excludedNumbers,
  };
}

export async function saveEventSettings(
  input: EventSettingsInput
): Promise<EventSettingsSaveResult> {
  const fieldErrors = validate(input);

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    const [previous] = await db
      .select()
      .from(eventSettings)
      .where(eq(eventSettings.id, ACTIVE_ID))
      .limit(1);
    const logoChange = resolveLogoChange({
      hasExistingLogo: Boolean(previous?.logoBytes),
      hasReplacementLogo: Boolean(input.logoBytes),
      removeLogo: input.removeLogo,
    });
    const baseValues = {
      title: input.title,
      description: input.description,
      accentColor: input.accentColor,
      minRange: input.minRange,
      maxRange: input.maxRange,
      excludedNumbers: input.excludedNumbers,
      logoAlt: input.logoAlt,
      updatedAt: new Date(),
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

    await db
      .insert(eventSettings)
      .values({ id: ACTIVE_ID, ...values })
      .onConflictDoUpdate({
        target: eventSettings.id,
        set: values,
      });

    return {
      ok: true,
      audit: {
        before: previous ? toAuditSnapshot(previous) : null,
        after: {
          ...toAuditSnapshot({
            ...input,
            logoBytes:
              logoChange === "replace"
                ? input.logoBytes
                : logoChange === "remove"
                  ? null
                  : (previous?.logoBytes ?? null),
            logoMime:
              logoChange === "replace"
                ? input.logoMime
                : logoChange === "remove"
                  ? null
                  : (previous?.logoMime ?? null),
          }),
          hasLogo:
            logoChange === "replace"
              ? true
              : logoChange === "remove"
                ? false
                : Boolean(previous?.logoBytes),
        },
        logoChange,
      },
    };
  } catch {
    return { ok: false, error: "Could not save settings." };
  }
}

export async function hasEventSettings(): Promise<boolean> {
  const [row] = await db
    .select({ id: eventSettings.id })
    .from(eventSettings)
    .where(eq(eventSettings.id, ACTIVE_ID))
    .limit(1);

  return Boolean(row);
}
