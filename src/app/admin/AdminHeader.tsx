import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { logoutAdmin } from "@/lib/actions";
import { cn } from "@/lib/utils";

type AdminSection = "settings" | "logs";

type AdminHeaderProps = {
  activeSection: AdminSection;
  title: string;
  description: string;
  showSettingsBackLink?: boolean;
};

const sections = [
  { href: "/admin", label: "Settings", value: "settings" },
  { href: "/admin/logs", label: "Audit logs", value: "logs" },
] as const;

export function AdminHeader(props: AdminHeaderProps) {
  const {
    activeSection,
    title,
    description,
    showSettingsBackLink = false,
  } = props;

  return (
    <header className="flex flex-col gap-5 border-b border-border pb-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <nav className="flex flex-wrap items-center gap-1" aria-label="Admin">
          {sections.map((section) => {
            const active = activeSection === section.value;

            return (
              <Link
                key={section.value}
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  buttonVariants({
                    variant: active ? "secondary" : "ghost",
                    size: "sm",
                  }),
                  "min-h-10"
                )}
              >
                {section.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "min-h-10"
            )}
          >
            Open picker
            <ExternalLinkIcon aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <Separator orientation="vertical" className="hidden h-7 sm:block" />
          <form action={logoutAdmin}>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              className="min-h-10"
            >
              Log out
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-2xl">
        {showSettingsBackLink ? (
          <Link
            href="/admin"
            className="mb-2 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            Back to event settings
          </Link>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
    </header>
  );
}
