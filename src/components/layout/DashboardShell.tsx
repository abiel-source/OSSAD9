"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui";
import { useCapabilitiesStore } from "@/store/capabilities";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen, closeSidebar } = useUIStore();
  const { fetchCapabilities } = useCapabilitiesStore();

  useEffect(() => {
    fetchCapabilities();
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--ossad-bg-primary)" }}
    >
      {/* Mobile backdrop */}
      {/* closes drawer on tap */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar />

      {/* Main content */}
      {/* always full width on mobile, sidebar is fixed overlay */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main
          className="flex-1 overflow-auto"
          style={{ backgroundColor: "var(--ossad-bg-primary)" }}
        >
          <div className="p-6">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
