export type LoginActionState =
  { status: "idle" } | { status: "error"; error: string };
