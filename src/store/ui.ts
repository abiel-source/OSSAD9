import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean; // desktop: icon-only width
  sidebarOpen: boolean; // mobile/tablet: drawer visible
  toggleSidebarCollapsed: () => void;
  toggleSidebarOpen: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: false,
  toggleSidebarCollapsed: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleSidebarOpen: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
