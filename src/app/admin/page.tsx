import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppFooter } from "@/components/layout/AppFooter";
import { isAdminAuthenticated } from "@/lib/auth.service";
import { getEventSettings } from "@/lib/event-settings.service";
import { resolveSiteUrl } from "@/lib/site-url";

import { AdminHeader } from "./AdminHeader";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = {
  title: "Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [settings, siteUrl] = await Promise.all([
    getEventSettings(),
    resolveSiteUrl(),
  ]);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:py-10">
      <AdminHeader
        activeSection="settings"
        title="Event settings"
        description="Manage event identity, sharing appearance, and the eligible draw pool."
      />

      <div className="flex-1">
        <SettingsForm settings={settings} shareUrl={siteUrl?.toString()} />
      </div>
      <AppFooter className="mt-8" />
    </main>
  );
}
