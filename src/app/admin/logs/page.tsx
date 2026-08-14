import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/auth.service";
import { getAdminAuditLogPage } from "@/lib/admin-logs.service";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";

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
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Admin control center
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Audit logs
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/admin" />}>
            Settings
          </Button>
          <Button variant="outline" size="sm" render={<Link href="/" />}>
            Open picker
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <section className="mt-6">
        <LogsTable page={page} />
      </section>
    </main>
  );
}
