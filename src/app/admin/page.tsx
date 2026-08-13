import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { logoutAdmin } from "@/lib/actions";
import { isAdminAuthenticated } from "@/lib/auth.service";
import { getEventSettings } from "@/lib/event-settings.service";

import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = {
  title: "Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const settings = await getEventSettings();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Event Settings</h1>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </form>
      </div>

      <SettingsForm settings={settings} />
    </main>
  );
}
