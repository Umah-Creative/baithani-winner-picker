"use client";

import { useMemo, type CSSProperties } from "react";
import { Play, RefreshCcw, Sparkles } from "lucide-react";
import { domAnimation, LazyMotion, m } from "motion/react";

import { AppFooter } from "@/components/layout/app-footer";
import { Button } from "@/components/ui/button";
import type { EventSettingsView } from "@/features/event-settings/event-settings.type";
import { createBrandPalette } from "@/shared/brand/brand-color";

import { ConfettiLayer } from "./components/confetti-layer";
import { DrawnNumbers } from "./components/drawn-numbers";
import { NewSessionDialog } from "./components/new-session-dialog";
import { PickerEventHeader } from "./components/picker-event-header";
import { RangeControls } from "./components/range-controls";
import { WinnerDisplay } from "./components/winner-display";
import { usePickerController } from "./hooks/use-picker-controller";

import "./picker.css";

type PickerProps = {
  settings: EventSettingsView;
};

export function Picker(props: PickerProps) {
  const { settings } = props;
  const picker = usePickerController(settings);
  const brandPalette = useMemo(
    () => createBrandPalette(settings.accentColor),
    [settings.accentColor]
  );
  const brandStyle = {
    "--brand": settings.accentColor,
    "--primary": settings.accentColor,
    "--primary-foreground": brandPalette.foreground,
    "--brand-display-light": brandPalette.displayLight,
    "--brand-display-dark": brandPalette.displayDark,
  } as CSSProperties;

  return (
    <LazyMotion features={domAnimation}>
      <m.main
        initial={picker.reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="picker-shell relative isolate flex min-h-svh flex-col overflow-x-hidden px-4 py-4 sm:px-7 sm:py-6 lg:px-10"
        style={brandStyle}
      >
        <ConfettiLayer
          winner={picker.winner}
          accent={settings.accentColor}
          reduceMotion={picker.reduceMotion}
        />

        <PickerEventHeader
          settings={settings}
          muted={picker.audio.muted}
          onToggleMuted={picker.audio.toggleMuted}
        />

        <section className="relative z-10 mx-auto flex w-full max-w-[110rem] flex-1 flex-col items-center justify-center py-3 sm:py-4">
          <RangeControls
            min={picker.minValue}
            max={picker.maxValue}
            disabled={picker.active}
            error={picker.rangeError}
            onMinChange={picker.handleMinChange}
            onMaxChange={picker.handleMaxChange}
          />

          <WinnerDisplay
            state={picker.stageState}
            reduceMotion={picker.reduceMotion}
            canStartNewSession={picker.canStartNewSession}
          />

          <div className="flex w-full flex-col items-center gap-3 px-1">
            <Button
              onClick={picker.handlePrimaryAction}
              disabled={picker.primaryDisabled}
              variant="stage"
              size="stage"
              className="w-full sm:w-auto"
            >
              {picker.canStartNewSession ? (
                <RefreshCcw data-icon="inline-start" className="size-5" />
              ) : picker.state.status === "spinning" ||
                picker.state.status === "revealing" ? (
                <Sparkles data-icon="inline-start" className="size-5" />
              ) : (
                <Play
                  data-icon="inline-start"
                  className="size-5 fill-current"
                />
              )}
              {picker.primaryLabel}
            </Button>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Press <kbd>Space</kbd> to{" "}
              {picker.state.status === "spinning" ? "reveal" : "continue"}
            </p>
          </div>
        </section>

        <div className="relative z-10 mx-auto w-full max-w-4xl">
          <DrawnNumbers
            drawnNumbers={picker.drawnNumbers}
            disabled={picker.active}
            reduceMotion={picker.reduceMotion}
            onUndoLast={picker.handleUndoLast}
            onRequestNewSession={picker.handleRequestNewSession}
          />
        </div>

        <NewSessionDialog
          open={picker.newSessionOpen}
          onOpenChange={picker.setNewSessionOpen}
          onConfirm={picker.handleNewSession}
        />

        <AppFooter />
        {picker.drawnCount > 0 ? (
          <span className="sr-only">{picker.drawnCount} numbers drawn.</span>
        ) : null}
      </m.main>
    </LazyMotion>
  );
}
