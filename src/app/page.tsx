import { Picker } from "@/components/picker/Picker";
import { getEventSettings } from "@/lib/event-settings.service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getEventSettings();

  if (!settings) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-lg text-white/70">
          Picker is not configured yet. Run the migration and create the active
          event row.
        </p>
      </main>
    );
  }

  return <Picker settings={settings} />;
}
