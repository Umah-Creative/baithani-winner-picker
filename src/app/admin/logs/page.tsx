import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppFooter } from "@/components/layout/AppFooter";
import { isAdminAuthenticated } from "@/lib/auth.service";
import { getAdminAuditLogPage } from "@/lib/admin-logs.service";

import { AdminHeader } from "../AdminHeader";
import { LogsTable } from "./LogsTable";

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
