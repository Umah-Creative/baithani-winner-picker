import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/features/admin-auth/server/admin-session.service";
import { AdminShell } from "@/features/admin-shell/admin-shell";
import { LogsTable } from "@/features/audit-log/audit-log-table";
import { getAdminAuditLogPage } from "@/features/audit-log/server/audit-log.query";

export const metadata: Metadata = { title: "Admin audit logs" };
export const dynamic = "force-dynamic";

export default async function AdminLogsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { searchParams } = props;
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const page = await getAdminAuditLogPage(await searchParams);

  return (
    <AdminShell
      activeSection="logs"
      title="Audit logs"
      description="Review administrative access and event-setting changes."
      contentClassName="mt-6"
      showSettingsBackLink
    >
      <LogsTable page={page} />
    </AdminShell>
  );
}
