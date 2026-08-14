"use client";

import { useMemo, type CSSProperties } from "react";
import { Play, RefreshCcw, Sparkles } from "lucide-react";
import { domAnimation, LazyMotion, m } from "motion/react";

import { AppFooter } from "@/components/layout/app-footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { EventSettingsView } from "@/features/event-settings/event-settings.type";
import { createBrandPalette } from "@/shared/brand/brand-color";

import { ConfettiLayer } from "./components/confetti-layer";
import { DrawnNumbers } from "./components/drawn-numbers";
import { PickerToolbar } from "./components/picker-toolbar";
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
          <PickerToolbar
            muted={picker.audio.muted}
            onToggleMuted={picker.audio.toggleMuted}
          />
        </header>

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

        <AlertDialog
          open={picker.newSessionOpen}
          onOpenChange={picker.setNewSessionOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start a new draw session?</AlertDialogTitle>
              <AlertDialogDescription>
                This clears all drawn numbers and returns them to the draw pool.
                Event settings and range stay unchanged. <br /> <br />
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep current session</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={picker.handleNewSession}
              >
                Start new session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AppFooter />
        {picker.drawnCount > 0 ? (
          <span className="sr-only">{picker.drawnCount} numbers drawn.</span>
        ) : null}
      </m.main>
    </LazyMotion>
  );
}
