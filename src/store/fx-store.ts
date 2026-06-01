"use client";

import { create } from "zustand";
import { nextTick, seedTicks } from "@/lib/fx-engine";
import type { FxTick } from "@/types";

interface FxState {
  ticks: FxTick[];
  /** Session-open rates, keyed by pair, for % change calc. */
  sessionOpen: Record<string, number>;
  running: boolean;
  lastUpdated: number;
  intervalId: ReturnType<typeof setInterval> | null;
  /** Begin streaming ticks at the given cadence (ms). */
  start: (intervalMs?: number) => void;
  /** Stop streaming. */
  stop: () => void;
}

/**
 * Global real-time FX store. Simulates a market data websocket by
 * mutating a mean-reverting random walk on a fixed cadence.
 */
export const useFxStore = create<FxState>((set, get) => {
  const initial = seedTicks();
  const sessionOpen = Object.fromEntries(initial.map((t) => [t.pair, t.rate]));

  return {
    ticks: initial,
    sessionOpen,
    running: false,
    lastUpdated: Date.now(),
    intervalId: null,

    start: (intervalMs = 1500) => {
      if (get().running) return;
      const id = setInterval(() => {
        set((state) => ({
          ticks: state.ticks.map((tick) =>
            nextTick(tick, state.sessionOpen[tick.pair] ?? tick.rate),
          ),
          lastUpdated: Date.now(),
        }));
      }, intervalMs);
      set({ running: true, intervalId: id });
    },

    stop: () => {
      const { intervalId } = get();
      if (intervalId) clearInterval(intervalId);
      set({ running: false, intervalId: null });
    },
  };
});
