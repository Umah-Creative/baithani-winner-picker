import { getEventSettings } from "@/features/event-settings/server/event-settings.query";
import { FirstRunState } from "@/features/picker/components/first-run-state";
import { Picker } from "@/features/picker/picker";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getEventSettings();

  if (!settings) {
    return <FirstRunState />;
  }

  return <Picker settings={settings} />;
}
