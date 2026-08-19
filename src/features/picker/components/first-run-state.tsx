import Link from "next/link";

import { AppFooter } from "@/components/layout/app-footer";

export function FirstRunState() {
  return (
    <main className="picker-shell flex min-h-svh flex-col px-6">
      <section className="flex flex-1 items-center justify-center py-10">
        <div className="max-w-lg text-center">
          <h1 className="text-4xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl">
            Winner picker is waiting backstage.
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Organizer can sign in, add event details, and set the draw range
            before doors open.
          </p>
          <Link
            href="/admin"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            Open admin setup
          </Link>
        </div>
      </section>
      <AppFooter className="pb-4" />
    </main>
  );
}
