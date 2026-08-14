export type PickerState =
  | { status: "idle" }
  | { status: "spinning"; displayNumber: number }
  | { status: "revealing"; displayNumber: number }
  | { status: "winner"; winner: number }
  | { status: "exhausted" };
