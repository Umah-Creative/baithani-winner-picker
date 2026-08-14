import Link from "next/link";

import { Picker } from "@/components/picker/Picker";
import { getEventSettings } from "@/lib/event-settings.service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getEventSettings();

  if (!settings) {
    return (
      <main className="picker-shell flex min-h-svh items-center justify-center px-6">
        <section className="max-w-lg text-center">
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
        </section>
      </main>
    );
  }

  return <Picker settings={settings} />;
}
