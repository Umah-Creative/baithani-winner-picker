import type { EventSettingsView } from "@/features/event-settings/event-settings.type";

import { PickerToolbar } from "./picker-toolbar";

type PickerEventHeaderProps = {
  settings: EventSettingsView;
  muted: boolean;
  onToggleMuted: () => void;
};

export function PickerEventHeader(props: PickerEventHeaderProps) {
  const { settings, muted, onToggleMuted } = props;

  return (
    <header className="relative z-50 flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        {settings.hasLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/media/logo?v=${encodeURIComponent(settings.updatedAt)}`}
            alt={settings.logoAlt}
            className="event-logo max-h-16 w-auto max-w-24 shrink-0 object-contain sm:max-h-24 sm:max-w-44 lg:max-h-28 lg:max-w-52"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-2 text-base leading-tight font-bold tracking-[-0.025em] text-foreground sm:line-clamp-1 sm:text-3xl lg:text-4xl">
            {settings.title}
          </h1>
          {settings.description ? (
            <p className="mt-1 hidden max-w-[68ch] text-pretty text-sm leading-relaxed text-muted-foreground md:line-clamp-2 lg:text-base">
              {settings.description}
            </p>
          ) : null}
        </div>
      </div>
      <PickerToolbar muted={muted} onToggleMuted={onToggleMuted} />
    </header>
  );
}
