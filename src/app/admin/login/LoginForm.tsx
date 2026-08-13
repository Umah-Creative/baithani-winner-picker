"use client";

import { useActionState } from "react";

import { loginAdmin, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <h1 className="text-xl font-semibold text-white">Admin Login</h1>
      <label className="mt-5 block text-sm font-medium text-white/70">
        Password
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-[var(--brand)]"
        />
      </label>
      {state.error ? (
        <p className="mt-3 text-sm text-red-300">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending} variant="primary" className="mt-5 w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
