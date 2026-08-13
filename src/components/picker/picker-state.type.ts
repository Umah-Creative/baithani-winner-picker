export type PickerState =
  | { status: "idle" }
  | { status: "spinning"; displayNumber: number }
  | { status: "winner"; winner: number }
  | { status: "exhausted" };
