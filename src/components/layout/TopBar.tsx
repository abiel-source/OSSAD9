"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Menu, LogIn } from "lucide-react";
import { ALL_ROUTES } from "@/lib/nav";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const pathname = usePathname();
  const { toggleSidebarCollapsed, toggleSidebarOpen } = useUIStore();
  const current = ALL_ROUTES[pathname];

  const handleHamburger = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      toggleSidebarCollapsed();
    } else {
      toggleSidebarOpen();
    }
  };

  return (
    <header className="flex items-center h-12 flex-shrink-0 px-2 gap-2 bg-card border-b border-border">
      {/* Hamburger */}
      <button
        onClick={handleHamburger}
        className="flex items-center justify-center w-8 h-8 flex-shrink-0 transition-colors duration-150 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
      >
        <Menu size={15} />
      </button>

      {/* Vertical divider */}
      <div className="h-4 w-px flex-shrink-0 bg-border" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
        {current?.parent ? (
          <>
            <span className="text-[11px] font-mono tracking-[0.1em] uppercase flex-shrink-0 text-muted-foreground">
              {current.parent}
            </span>
            <span className="text-[10px] flex-shrink-0 text-muted-foreground opacity-40">
              ›
            </span>
            <span className="text-[11px] font-mono tracking-[0.1em] uppercase flex-shrink-0 text-primary">
              {current.label}
            </span>
          </>
        ) : current ? (
          <span className="text-[11px] font-mono tracking-[0.1em] uppercase flex-shrink-0 text-primary">
            {current.label}
          </span>
        ) : null}

        {/* Description — only on wide screens */}
        {current?.description && (
          <span className="text-[10px] font-mono truncate hidden xl:block text-muted-foreground opacity-50">
            — {current.description}
          </span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Remote/Local status badge */}
        <StatusBadge variant="success">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-500" />
          <span className="hidden sm:block">Remote</span>
        </StatusBadge>

        <div className="h-4 w-px bg-border" />

        <IconButton title="Search">
          <Search size={14} />
        </IconButton>

        <IconButton title="Alerts">
          <Bell size={14} />
        </IconButton>

        {/* Sign In */}
        <StatusBadge variant="primary" asButton>
          <LogIn size={11} className="flex-shrink-0" />
          <span>Sign In</span>
        </StatusBadge>
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

function StatusBadge({
  variant,
  asButton = false,
  children,
}: {
  variant: "success" | "primary";
  asButton?: boolean;
  children: React.ReactNode;
}) {
  const cls = cn(
    "flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono tracking-[0.2em] uppercase flex-shrink-0",
    variant === "success" && "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500",
    variant === "primary" && "bg-primary/10 border border-primary/20 text-primary"
  );

  return asButton ? (
    <button className={cls}>{children}</button>
  ) : (
    <div className={cls}>{children}</div>
  );
}
