"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/types";

const SessionContext = createContext<SessionUser | null>(null);

/**
 * Provides the authenticated user to client components for RBAC gating.
 * Hydrated from the server-resolved session.
 */
export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionUser {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }
  return ctx;
}
