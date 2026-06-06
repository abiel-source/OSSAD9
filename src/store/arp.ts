import { create } from "zustand";
import { ArpEntry } from "@/types/network";

interface ArpState {
  entries: ArpEntry[];
  isRunning: boolean;

  setEntries: (_entries: ArpEntry[]) => void;
  appendEntries: (_entries: ArpEntry[]) => void;
  setIsRunning: (_isRunning: boolean) => void;
  reset: () => void;
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
    }),
}));
