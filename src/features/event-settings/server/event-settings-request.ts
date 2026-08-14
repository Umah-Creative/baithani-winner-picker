import "server-only";

import { DEFAULT_ACCENT_COLOR } from "../event-settings.constant";
import type { EventSettingsFieldError } from "../event-settings.type";
import { parseExcludedNumbers } from "../event-settings.validation";
import type { EventSettingsPersistenceInput } from "./event-settings-persistence.type";

export async function parseEventSettingsFormData(
  formData: FormData
): Promise<
  | { ok: true; input: EventSettingsPersistenceInput }
  | { ok: false; fieldErrors: EventSettingsFieldError }
> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const accentColor = String(
    formData.get("accentColor") ?? DEFAULT_ACCENT_COLOR
  ).trim();
  const minRange = Number(formData.get("minRange"));
  const maxRange = Number(formData.get("maxRange"));
  const logoAlt = String(formData.get("logoAlt") ?? "").trim();
  const excludedNumbersResult = parseExcludedNumbers(
    String(formData.get("excludedNumbers") ?? ""),
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
  const hasLogoFile = logo instanceof File && logo.size > 0;
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
      logoBytes: hasLogoFile ? Buffer.from(await logo.arrayBuffer()) : null,
      logoMime: hasLogoFile ? logo.type : null,
      removeLogo: formData.get("removeLogo") === "on",
    },
  };
}
