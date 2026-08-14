import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/auth.service";
import { getEventSettings } from "@/lib/event-settings.service";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

import { LoginForm } from "./LoginForm";

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
    <main className="relative flex min-h-svh items-center justify-center px-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
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
    </main>
  );
}
