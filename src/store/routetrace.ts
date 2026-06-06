import { create } from "zustand";
import { Hop } from "@/types/network";

interface RouteTraceState {
  hops: Hop[];
  isRunning: boolean;

  appendHops: (_hops: Hop[]) => void;
  setHops: (_hops: Hop[]) => void;
  setIsRunning: (isRunning: boolean) => void;
  reset: () => void;
}

export const useRouteTraceStore = create<RouteTraceState>((set, get) => ({
  isRunning: false,
  hops: [],

  appendHops: (_hops) => {
    const { hops } = get();
    set({ hops: [...hops, ..._hops] });
  },

  setHops: (_hops) => set({ hops: _hops }),

  setIsRunning: (_isRunning) => set({ isRunning: _isRunning }),

  reset: () =>
    set({
      isRunning: false,
      hops: [],
    }),
}));
