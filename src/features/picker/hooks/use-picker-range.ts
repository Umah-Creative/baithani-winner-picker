"use client";

import { useState } from "react";

import { getRangeError } from "../picker-range";

export function usePickerRange(initialMin: number, initialMax: number) {
  const [minValue, setMinValue] = useState(String(initialMin));
  const [maxValue, setMaxValue] = useState(String(initialMax));
  const rangeError = getRangeError(minValue, maxValue);
  const min = rangeError ? 1 : Number(minValue);
  const max = rangeError ? 0 : Number(maxValue);

  return {
    minValue,
    maxValue,
    setMinValue,
    setMaxValue,
    rangeError,
    min,
    max,
  };
}
