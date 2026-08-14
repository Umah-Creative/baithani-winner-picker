import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { logoutAdmin } from "@/lib/actions";
import { isAdminAuthenticated } from "@/lib/auth.service";
import { getEventSettings } from "@/lib/event-settings.service";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">
          Event Settings
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      <SettingsForm settings={settings} />
    </main>
  );
}
