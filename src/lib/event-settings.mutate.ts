import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { eventSettings } from "@/lib/schema";
import type {
  EventSettingsFieldError,
  EventSettingsInput,
  EventSettingsSaveResult,
} from "@/lib/event-settings.type";

const ACTIVE_ID = 1;
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

function validate(input: EventSettingsInput): EventSettingsFieldError {
  const fieldErrors: EventSettingsFieldError = {};

  if (!input.title) {
    fieldErrors.title = "Title is required.";
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(input.accentColor)) {
    fieldErrors.accentColor =
      "Accent color must be a 6-digit hex value like #f0b429.";
  }

  if (
    !Number.isInteger(input.minRange) ||
    !Number.isInteger(input.maxRange) ||
    input.minRange >= input.maxRange
  ) {
    fieldErrors.minRange = "Min must be less than max and both must be integers.";
    fieldErrors.maxRange = "Max must be greater than min.";
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

export async function saveEventSettings(
  input: EventSettingsInput,
): Promise<EventSettingsSaveResult> {
  const fieldErrors = validate(input);

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

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

  const values = input.removeLogo
    ? { ...baseValues, logoBytes: null, logoMime: null }
    : {
        ...baseValues,
        ...(input.logoBytes ? { logoBytes: input.logoBytes } : {}),
        ...(input.logoMime ? { logoMime: input.logoMime } : {}),
      };

  try {
    await db
      .insert(eventSettings)
      .values({ id: ACTIVE_ID, ...values })
      .onConflictDoUpdate({
        target: eventSettings.id,
        set: values,
      });

    return { ok: true };
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
