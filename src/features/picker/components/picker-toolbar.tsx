"use client";

import { Volume2, VolumeX } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FullscreenToggle } from "./fullscreen-toggle";

type PickerToolbarProps = {
  muted: boolean;
  onToggleMuted: () => void;
};

export function PickerToolbar(props: PickerToolbarProps) {
  const { muted, onToggleMuted } = props;
  const audioLabel = muted ? "Unmute sound" : "Mute sound";

  return (
    <div className="picker-toolbar flex items-center gap-1 rounded-full p-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xl"
              onClick={onToggleMuted}
              aria-label={audioLabel}
              aria-pressed={muted}
            />
          }
        >
          {muted ? <VolumeX /> : <Volume2 />}
        </TooltipTrigger>
        <TooltipContent>{audioLabel}</TooltipContent>
      </Tooltip>
      <ThemeToggle />
      <FullscreenToggle />
    </div>
  );
}
