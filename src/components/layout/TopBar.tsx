"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Menu, LogIn } from "lucide-react";
import { ALL_ROUTES } from "@/lib/nav";
import { useUIStore } from "@/store/ui";
import { useCapabilitiesStore } from "@/store/capabilities";
import { cn } from "@/lib/utils";
import React from "react";

export default function TopBar() {
  const pathname = usePathname();
  const { toggleSidebarCollapsed, toggleSidebarOpen } = useUIStore();
  const { isRemoteDeployment, isLoading } = useCapabilitiesStore();
  const current = ALL_ROUTES[pathname];

  const handleHamburger = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      toggleSidebarCollapsed();
    } else {
      toggleSidebarOpen();
    }
  };

  return (
    <header className="flex items-center h-14 flex-shrink-0 px-3 gap-2 bg-card border-b border-border">
      {/* Hamburger */}
      <button
        onClick={handleHamburger}
        className="flex items-center justify-center w-8 h-8 flex-shrink-0 transition-colors duration-150 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
      >
        <Menu size={16} />
      </button>

      {/* Vertical divider */}
      <div className="h-4 w-px flex-shrink-0 bg-border" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
        {current?.parent ? (
          <>
            <span className="text-[13px] flex-shrink-0 text-muted-foreground">
              {current.parent}
            </span>
            <span className="text-[13px] flex-shrink-0 text-muted-foreground opacity-40">
              ›
            </span>
            <span className="text-[13px] flex-shrink-0 text-foreground">
              {current.label}
            </span>
          </>
        ) : current ? (
          <span className="text-[13px] flex-shrink-0 text-foreground">
            {current.label}
          </span>
        ) : null}

        {current?.description && (
          <span className="text-[11px] truncate hidden xl:block text-muted-foreground opacity-50">
            — {current.description}
          </span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isLoading && (
          <StatusBadge deployment={isRemoteDeployment ? "remote" : "local"} />
        )}

        <div className="h-4 w-px bg-border" />

        <IconButton title="Search">
          <Search size={14} />
        </IconButton>
        <IconButton title="Alerts">
          <Bell size={14} />
        </IconButton>

        <button className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase flex-shrink-0 bg-primary text-primary-foreground border border-primary">
          <LogIn size={11} className="flex-shrink-0" />
          <span>Sign In</span>
        </button>
      </div>
    </header>
  );
}

function IconButton({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className="flex items-center justify-center w-8 h-8 transition-colors duration-150 cursor-pointer text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      title={title}
    >
      {children}
    </button>
  );
}

function StatusBadge({ deployment }: { deployment: "local" | "remote" }) {
  const isRemoteDeployment = deployment === "remote";
  const cls = cn(
    "flex items-center gap-1.5 px-2 py-1 text-[10px] flex-shrink-0 uppercase",
    !isRemoteDeployment && "text-emerald-500",
    isRemoteDeployment && "text-amber-500",
    "group relative",
  );
  const clsToolTip = cn(
    "hidden group-hover:block absolute",
    "w-48 top-full left-1/2 -translate-x-1/2 normal-case text-center text-primary-foreground",
    "bg-card border border-border p-2",
  );
  const remoteTooltip: string =
    "Remote Mode: Some features of this application are unavailable due to network access limitations. Consider using a local deployment instead. Instructions available at: https://github.com/abiel-source/OSSAD9";
  const localTooltip: string =
    "Local Mode: All features of this application are available.";

  return (
    <div className={cls}>
      <span className="hidden sm:block">
        {isRemoteDeployment ? "Remote" : "Local"}
      </span>
      <div className={clsToolTip}>
        {isRemoteDeployment ? remoteTooltip : localTooltip}
      </div>
    </div>
  );
}
