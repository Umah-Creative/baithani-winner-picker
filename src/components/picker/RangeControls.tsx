"use client";

type RangeControlsProps = {
  min: number;
  max: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
};

export function RangeControls(props: RangeControlsProps) {
  const { min, max, onMinChange, onMaxChange } = props;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-white">
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-wider text-white/60 backdrop-blur">
        Min
        <input
          type="number"
          value={min}
          onChange={(event) => onMinChange(event.target.valueAsNumber)}
          className="w-20 rounded-md bg-transparent py-1 text-center text-lg font-semibold tabular-nums text-white outline-none focus:ring-1 focus:ring-[var(--brand)]"
        />
      </label>
      <span className="text-white/30">—</span>
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-wider text-white/60 backdrop-blur">
        Max
        <input
          type="number"
          value={max}
          onChange={(event) => onMaxChange(event.target.valueAsNumber)}
          className="w-20 rounded-md bg-transparent py-1 text-center text-lg font-semibold tabular-nums text-white outline-none focus:ring-1 focus:ring-[var(--brand)]"
        />
      </label>
    </div>
  );
}
