import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/features/admin-auth/server/admin-session.service";
import { AdminShell } from "@/features/admin-shell/admin-shell";
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
    <AdminShell
      activeSection="settings"
      title="Event settings"
      description="Manage event identity, sharing appearance, and the eligible draw pool."
    >
      <SettingsForm settings={settings} shareUrl={siteUrl?.toString()} />
    </AdminShell>
  );
}
