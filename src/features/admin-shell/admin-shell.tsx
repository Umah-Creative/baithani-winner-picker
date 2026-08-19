import { AppFooter } from "@/components/layout/app-footer";

import { AdminHeader } from "./admin-header";

type AdminShellProps = {
  activeSection: "settings" | "logs";
  title: string;
  description: string;
  contentClassName?: string;
  showSettingsBackLink?: boolean;
  children: React.ReactNode;
};

export function AdminShell(props: AdminShellProps) {
  const {
    activeSection,
    title,
    description,
    contentClassName,
    showSettingsBackLink,
    children,
  } = props;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:py-10">
      <AdminHeader
        activeSection={activeSection}
        title={title}
        description={description}
        showSettingsBackLink={showSettingsBackLink}
      />
      <section className={`flex-1 ${contentClassName ?? ""}`}>
        {children}
      </section>
      <AppFooter className="mt-8" />
    </main>
  );
}
