"use client";

import { Button } from "@/components/ui/button";

type DrawnNumbersProps = {
  drawnNumbers: number[];
  onUndoLast: () => void;
  onClear: () => void;
};

export function DrawnNumbers(props: DrawnNumbersProps) {
  const { drawnNumbers, onUndoLast, onClear } = props;

  if (drawnNumbers.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Drawn numbers
        </h2>
        <span className="text-sm tabular-nums text-muted-foreground">
          {drawnNumbers.length} drawn
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {drawnNumbers.map((number, index) => (
          <span
            key={`${number}-${index}`}
            className={
              index === drawnNumbers.length - 1
                ? "rounded-lg bg-primary px-2 py-1 text-sm font-semibold tabular-nums text-primary-foreground"
                : "rounded-lg border border-border bg-muted px-2 py-1 text-sm tabular-nums text-foreground"
            }
          >
            {number}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button onClick={onUndoLast} variant="ghost" size="sm">
          Undo last
        </Button>
        <Button onClick={onClear} variant="destructive" size="sm">
          Clear history
        </Button>
      </div>
    </div>
  );
}
