import { create } from "zustand";
import type { DiscoveredHost, ScanLogEntry, ScanEvent } from "@/types/network";

interface TopologyState {
  isScanning: boolean;
  hosts: Record<string, DiscoveredHost>; // keyed by IP
  logs: ScanLogEntry[];

  startScan: () => void;
  handleScanEvent: (event: ScanEvent) => void;
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

let _logId = 0;

const newLog = (
  level: ScanLogEntry["level"],
  message: string
): ScanLogEntry => ({
  id: String(++_logId),
  timestamp: Date.now(),
  level,
  message,
});

export const useTopologyStore = create<TopologyState>((set, get) => ({
  isScanning: false,
  hosts: {},
  logs: [],

  startScan: () => set({ isScanning: true, hosts: {}, logs: [] }),

  handleScanEvent: (event) => {
    const { logs, hosts } = get();

    switch (event.type) {
      case "host_discovered":
        set({
          hosts: { ...hosts, [event.host.ip]: event.host },
        });
        break;

      case "log":
        set({ logs: [...logs, newLog(event.level, event.message)] });
        break;

      case "complete":
        set({
          isScanning: false,
          logs: [
            ...get().logs,
            newLog(
              "success",
              `Discovery complete — ${event.hostsFound} host${
                event.hostsFound !== 1 ? "s" : ""
              } found in ${(event.durationMs / 1000).toFixed(1)}s`
            ),
          ],
        });
        break;

      case "error":
        set({
          isScanning: false,
          logs: [...get().logs, newLog("error", event.message)],
        });
        break;
    }
  },

  reset: () =>
    set({
      isScanning: false,
      hosts: {},
      logs: [],
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
