import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/layout/admin-header";
import { AppFooter } from "@/components/layout/app-footer";
import { isAdminAuthenticated } from "@/features/admin-auth/server/admin-session.service";
import { LogsTable } from "@/features/audit-log/audit-log-table";
import { getAdminAuditLogPage } from "@/features/audit-log/server/audit-log.query";

export const metadata: Metadata = { title: "Admin audit logs" };
export const dynamic = "force-dynamic";

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const page = await getAdminAuditLogPage(await searchParams);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:py-10">
      <AdminHeader
        activeSection="logs"
        title="Audit logs"
        description="Review administrative access and event-setting changes."
        showSettingsBackLink
      />
      <section className="mt-6 flex-1">
        <LogsTable page={page} />
      </section>
      <AppFooter className="mt-8" />
    </main>
  );
}
