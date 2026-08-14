"use client";

type RangeControlsProps = {
  min: number;
  max: number;
  disabled: boolean;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
};

export function RangeControls(props: RangeControlsProps) {
  const { min, max, disabled, onMinChange, onMaxChange } = props;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-foreground">
      <label className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
        Min
        <input
          type="number"
          value={min}
          disabled={disabled}
          onChange={(event) => onMinChange(event.target.valueAsNumber)}
          className="w-20 rounded-md bg-transparent py-1 text-center text-lg font-semibold tabular-nums text-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
        />
      </label>
      <span aria-hidden="true" className="text-muted-foreground">
        —
      </span>
      <label className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
        Max
        <input
          type="number"
          value={max}
          disabled={disabled}
          onChange={(event) => onMaxChange(event.target.valueAsNumber)}
          className="w-20 rounded-md bg-transparent py-1 text-center text-lg font-semibold tabular-nums text-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
        />
      </label>
    </div>
  );
}
