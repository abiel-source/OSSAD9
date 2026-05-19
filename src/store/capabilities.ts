import { create } from "zustand";
import type { CapabilitiesResponse } from "@/app/api/capabilities/route";

interface CapabilitiesStore {
  environment: CapabilitiesResponse["environment"] | null;
  hasNmap: boolean;
  hasTraceroute: boolean;
  isRemoteDeployment: boolean;
  isLoading: boolean;
  fetchCapabilities: () => Promise<void>;
}

export const useCapabilitiesStore = create<CapabilitiesStore>((set) => ({
  environment: null,
  hasNmap: false,
  hasTraceroute: false,
  isRemoteDeployment: true,
  isLoading: false,

  fetchCapabilities: async () => {
    set({ isLoading: true });

    try {
      const res = await fetch("/api/capabilities");
      const data: CapabilitiesResponse = await res.json();

      set({
        environment: data.environment,
        hasNmap: data.hasNmap,
        hasTraceroute: data.hasTraceroute,
        isRemoteDeployment: data.isRemoteDeployment,
        isLoading: false,
      });
    } catch {
      // If the request fails, assume remote environment as the safe default
      set({
        environment: "vercel",
        hasNmap: false,
        hasTraceroute: false,
        isRemoteDeployment: true,
        isLoading: false,
      });
    }
  },
}));
