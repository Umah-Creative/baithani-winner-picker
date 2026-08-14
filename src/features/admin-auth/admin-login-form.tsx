"use client";

import { useActionState, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loginAdmin } from "./admin-auth.action";
import type { LoginActionState } from "./admin-auth.type";

const initialState: LoginActionState = { status: "idle" };

export function LoginForm({ identity }: { identity: string }) {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <p className="text-sm font-medium text-primary">{identity}</p>
      <h1 className="mt-1 text-xl font-semibold text-foreground">
        Admin login
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the event admin password to continue.
      </p>
      <label className="mt-5 block text-sm font-medium text-muted-foreground">
        Password
        <span className="relative mt-2 block">
          <Input
            type={passwordVisible ? "text" : "password"}
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            aria-invalid={state.status === "error"}
            aria-describedby={
              state.status === "error" ? "login-error" : undefined
            }
            className="pr-12"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="absolute top-1/2 right-1 -translate-y-1/2"
          >
            {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </span>
      </label>
      {state.status === "error" ? (
        <p
          id="login-error"
          role="alert"
          className="mt-3 text-sm text-destructive"
        >
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
