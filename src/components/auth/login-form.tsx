"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loginAction, type LoginState } from "@/server/actions/auth-actions";

const INITIAL: LoginState = {};

/**
 * Credential login form wired to the `loginAction` server action via
 * React 19's `useActionState` (pending state + server-returned errors).
 */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-negative/30 bg-negative/10 px-3 py-2.5 text-sm text-negative"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Work email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            className={cn(
              "h-11 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring",
              state.fieldErrors?.email ? "border-negative" : "border-input",
            )}
          />
        </div>
        {state.fieldErrors?.email && (
          <p className="text-xs text-negative">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className={cn(
              "h-11 w-full rounded-lg border bg-card pl-9 pr-10 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring",
              state.fieldErrors?.password ? "border-negative" : "border-input",
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {state.fieldErrors?.password && (
          <p className="text-xs text-negative">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
