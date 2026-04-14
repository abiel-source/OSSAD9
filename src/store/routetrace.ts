import { create } from "zustand";
import { Hop } from "@/types/network";

interface RouteTraceState {
  hops: Hop[];
  isRunning: boolean;

  appendHops: (_hops: Hop[]) => void;
  setHops: (_hops: Hop[]) => void;
  setIsRunning: (isRunning: boolean) => void;
  reset: () => void;

  // front-end data simulation
  timeoutRefs: number[];
  dispatchedCountRef: number;
  appendTimeoutRef: (timeoutRef: number) => void;
  emptyTimeoutRefs: () => void;
  incrementDispatchCount: () => void;

  isPaused: boolean;
  setIsPaused: (_isPaused: boolean) => void;
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
      timeoutRefs: [],
      dispatchedCountRef: 0,
      isPaused: false,
    }),

  // front-end data simulation
  timeoutRefs: [],
  dispatchedCountRef: 0,
  appendTimeoutRef: (timeoutRef) => {
    const { timeoutRefs } = get();
    set({ timeoutRefs: [...timeoutRefs, timeoutRef] });
  },
  emptyTimeoutRefs: () => set({ timeoutRefs: [] }),
  incrementDispatchCount: () => {
    const { dispatchedCountRef } = get();
    set({ dispatchedCountRef: dispatchedCountRef + 1 });
  },

  isPaused: false,
  setIsPaused: (_isPaused) => set({ isPaused: _isPaused }),
}));
