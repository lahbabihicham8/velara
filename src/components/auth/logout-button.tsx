"use client";

import { useFormStatus } from "react-dom";
import { Loader2, LogOut } from "lucide-react";
import { logoutAction } from "@/server/actions/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-[18px] animate-spin" />
      ) : (
        <LogOut className="size-[18px]" />
      )}
      Sign out
    </button>
  );
}

/**
 * Sign-out control. Submits to the `logoutAction` server action, which
 * revokes the DB session and clears the cookie.
 */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <SubmitButton />
    </form>
  );
}
