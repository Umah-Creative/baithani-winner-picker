export type LoginActionState =
  | { status: "idle" }
  | {
      status: "error";
      reason: "invalid_credentials" | "rate_limited" | "configuration";
      error: string;
    };
