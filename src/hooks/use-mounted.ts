"use client";

import { useEffect, useState } from "react";

/**
 * Returns true once the component has mounted on the client.
 * Used to defer rendering of theme-dependent UI and avoid hydration
 * mismatches with persisted (localStorage) preferences.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Intentional client-only flag flip after first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return mounted;
}
