"use client";

import { Input } from "@/components/ui/input";
import {
  MAX_DRAW_NUMBER,
  MIN_DRAW_NUMBER,
} from "@/shared/draw-pool/draw-pool.constant";

type RangeControlsProps = {
  min: string;
  max: string;
  disabled: boolean;
  error: string | null;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
};

export function RangeControls(props: RangeControlsProps) {
  const { min, max, disabled, error, onMinChange, onMaxChange } = props;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="range-controls grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl p-2 sm:gap-3">
        <label className="grid grid-cols-[auto_1fr] items-center gap-2">
          <span className="pl-2 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
            Min
          </span>
          <Input
            variant="range"
            type="number"
            inputMode="numeric"
            min={MIN_DRAW_NUMBER}
            max={9999}
            step={1}
            value={min}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "range-error" : undefined}
            onChange={(event) => onMinChange(event.target.value)}
          />
        </label>
        <span aria-hidden="true" className="text-muted-foreground">
          —
        </span>
        <label className="grid grid-cols-[auto_1fr] items-center gap-2">
          <span className="pl-2 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
            Max
          </span>
          <Input
            variant="range"
            type="number"
            inputMode="numeric"
            min={2}
            max={MAX_DRAW_NUMBER}
            step={1}
            value={max}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "range-error" : undefined}
            onChange={(event) => onMaxChange(event.target.value)}
          />
        </label>
      </div>
      {error ? (
        <p id="range-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Inclusive draw range</p>
      )}
    </div>
  );
}
