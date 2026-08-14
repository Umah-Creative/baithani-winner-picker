"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
} from "@/lib/auth.service";
import { saveEventSettings } from "@/lib/event-settings.mutate";
import type {
  EventSettingsFieldError,
  EventSettingsInput,
} from "@/lib/event-settings.type";

export type ActionState = {
  error?: string;
  fieldErrors?: EventSettingsFieldError;
  success?: boolean;
};

export async function loginAdmin(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    return { error: "Invalid password." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

async function parseFormData(formData: FormData): Promise<EventSettingsInput> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const accentColor = String(formData.get("accentColor") ?? "#d076b4").trim();
  const minRange = Number(formData.get("minRange"));
  const maxRange = Number(formData.get("maxRange"));
  const logoAlt = String(formData.get("logoAlt") ?? "").trim();
  const excludedRaw = String(formData.get("excludedNumbers") ?? "");

  const excludedNumbers = excludedRaw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number)
    .filter((value) => Number.isInteger(value));

  const logo = formData.get("logo");
  const logoBytes =
    logo instanceof File && logo.size > 0
      ? Buffer.from(await logo.arrayBuffer())
      : null;
  const logoMime = logo instanceof File && logo.size > 0 ? logo.type : null;
  const removeLogo = formData.get("removeLogo") === "on";

  return {
    title,
    description,
    accentColor,
    minRange,
    maxRange,
    excludedNumbers,
    logoAlt,
    logoBytes,
    logoMime,
    removeLogo,
  };
}

export async function updateEventSettings(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAdminAuthenticated())) {
    return { error: "Not authorized." };
  }

  const input = await parseFormData(formData);
  const result = await saveEventSettings(input);

  if (!result.ok) {
    return {
      error: result.error,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}
