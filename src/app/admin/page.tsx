import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/layout/admin-header";
import { AppFooter } from "@/components/layout/app-footer";
import { isAdminAuthenticated } from "@/features/admin-auth/server/admin-session.service";
import { SettingsForm } from "@/features/event-settings/event-settings-form";
import { getEventSettings } from "@/features/event-settings/server/event-settings.query";
import { resolveSiteUrl } from "@/shared/site-url/resolve-site-url.server";

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
