"use client";

import { useActionState } from "react";

import { loginAdmin, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <h1 className="text-xl font-semibold text-foreground">Admin Login</h1>
      <label className="mt-5 block text-sm font-medium text-muted-foreground">
        Password
        <Input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          aria-invalid={Boolean(state.error)}
          className="mt-2"
        />
      </label>
      {state.error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        variant="default"
        className="mt-5 w-full"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
