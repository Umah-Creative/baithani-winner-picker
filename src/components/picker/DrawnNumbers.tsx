"use client";

import { useEffect, useRef } from "react";
import { RefreshCcw, Undo2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DrawnNumbersProps = {
  drawnNumbers: number[];
  disabled: boolean;
  reduceMotion: boolean;
  onUndoLast: () => void;
  onRequestNewSession: () => void;
};

export function DrawnNumbers(props: DrawnNumbersProps) {
  const {
    drawnNumbers,
    disabled,
    reduceMotion,
    onUndoLast,
    onRequestNewSession,
  } = props;
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    railRef.current?.scrollTo({
      left: railRef.current.scrollWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [drawnNumbers.length, reduceMotion]);

  if (drawnNumbers.length === 0) {
    return null;
  }

  return (
    <Card className="history-card w-full" size="sm">
      <CardHeader className="items-center gap-3 sm:grid-cols-[1fr_auto]">
        <CardTitle className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">
          Drawn numbers
        </CardTitle>
        <CardAction>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {drawnNumbers.length} drawn
          </span>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div
          ref={railRef}
          className="history-rail flex min-w-0 gap-2 overflow-x-auto overflow-y-hidden pb-2"
          aria-label="Drawn number history"
        >
          {drawnNumbers.map((number, index) => {
            const latest = index === drawnNumbers.length - 1;
            return (
              <Badge
                key={`${number}-${index}`}
                variant={latest ? "latest" : "history"}
                className="shrink-0 font-mono tabular-nums"
              >
                {number}
              </Badge>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-2">
        <Button
          onClick={onUndoLast}
          disabled={disabled}
          variant="ghost"
          size="sm"
        >
          <Undo2 data-icon="inline-start" />
          Undo last
        </Button>

        <Button
          onClick={onRequestNewSession}
          disabled={disabled}
          variant="outline"
          size="sm"
        >
          <RefreshCcw data-icon="inline-start" />
          New session
        </Button>
      </CardFooter>
    </Card>
  );
}
