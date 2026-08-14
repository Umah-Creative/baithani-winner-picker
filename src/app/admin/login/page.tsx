import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppFooter } from "@/components/layout/app-footer";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LoginForm } from "@/features/admin-auth/admin-login-form";
import { isAdminAuthenticated } from "@/features/admin-auth/server/admin-session.service";
import { getEventSettings } from "@/features/event-settings/server/event-settings.query";

export const metadata: Metadata = {
  title: "Admin Login",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const settings = await getEventSettings();
  const identity = settings?.title || "Baithani Winner Picker";
  const logoUrl = settings?.hasLogo
    ? `/api/media/logo?v=${encodeURIComponent(settings.updatedAt)}`
    : undefined;

  return (
    <main className="relative flex min-h-svh flex-col px-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-sm">
          <div className="mb-5 flex items-center gap-3 text-foreground">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={`${identity} logo`}
                className="size-11 rounded-xl border border-border bg-card object-contain p-1"
              />
            ) : (
              <div className="grid size-11 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                B
              </div>
            )}
            <span className="font-semibold">{identity}</span>
          </div>
          <LoginForm identity={identity} />
        </div>
      </div>
      <AppFooter className="w-full pb-4" />
    </main>
  );
}
