import { create } from "zustand";
import { ArpEntry } from "@/types/network";

interface ArpState {
  entries: ArpEntry[];
  isRunning: boolean;

  setEntries: (_entries: ArpEntry[]) => void;
  appendEntries: (_entries: ArpEntry[]) => void;
  setIsRunning: (_isRunning: boolean) => void;
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

export const useArpStore = create<ArpState>((set, get) => ({
  isRunning: false,
  entries: [],
  setEntries: (_entries) => set({ entries: _entries }),
  appendEntries: (_entries) => {
    const { entries } = get();
    set({ entries: [...entries, ..._entries] });
  },
  setIsRunning: (_isRunning) => set({ isRunning: _isRunning }),
  reset: () =>
    set({
      isRunning: false,
      entries: [],
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
