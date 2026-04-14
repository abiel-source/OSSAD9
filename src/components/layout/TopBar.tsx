"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Menu, LogIn } from "lucide-react";
import { ALL_ROUTES } from "@/lib/nav";
import { useUIStore } from "@/store/ui";

export default function TopBar() {
  const pathname = usePathname();
  const { toggleSidebarCollapsed, toggleSidebarOpen } = useUIStore();
  const current = ALL_ROUTES[pathname];

  // Hamburger: collapses on desktop, opens drawer on mobile/tablet
  const handleHamburger = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      toggleSidebarCollapsed();
    } else {
      toggleSidebarOpen();
    }
  };

  return (
    <header
      className="flex items-center h-12 flex-shrink-0 px-2 gap-2"
      style={{
        backgroundColor: "var(--ossad-bg-surface)",
        borderBottom: "1px solid var(--ossad-border)",
      }}
    >
      {/* Hamburger */}
      <button
        onClick={handleHamburger}
        className="flex items-center justify-center w-8 h-8 rounded-[3px] flex-shrink-0 transition-colors duration-150 hover:bg-white/3"
        style={{ color: "var(--ossad-text-secondary)" }}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
      >
        <Menu size={15} />
      </button>

      {/* Vertical divider */}
      <div
        className="h-4 w-px flex-shrink-0"
        style={{ backgroundColor: "var(--ossad-border)" }}
      />

      {/* Breadcrumb  */}
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
        {current?.parent ? (
          <>
            <span
              className="text-[11px] font-mono tracking-[0.1em] uppercase flex-shrink-0"
              style={{ color: "var(--ossad-text-secondary)" }}
            >
              {current.parent}
            </span>
            <span
              className="text-[10px] flex-shrink-0"
              style={{ color: "var(--ossad-text-secondary)", opacity: 0.4 }}
            >
              ›
            </span>
            <span
              className="text-[11px] font-mono tracking-[0.1em] uppercase flex-shrink-0"
              style={{ color: "var(--ossad-accent)" }}
            >
              {current.label}
            </span>
          </>
        ) : current ? (
          <span
            className="text-[11px] font-mono tracking-[0.1em] uppercase flex-shrink-0"
            style={{ color: "var(--ossad-accent)" }}
          >
            {current.label}
          </span>
        ) : null}

        {/* Description — only on wide screens */}
        {current?.description && (
          <span
            className="text-[10px] font-mono truncate hidden xl:block"
            style={{ color: "var(--ossad-text-secondary)", opacity: 0.5 }}
          >
            — {current.description}
          </span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Local mode badge */}
        <StatusBadge color="var(--ossad-online)" colorRaw="16,185,129">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: "var(--ossad-online)" }}
          />
          <span className="hidden sm:block">Remote</span>
        </StatusBadge>

        {/* Divider */}
        <div
          className="h-4 w-px"
          style={{ backgroundColor: "var(--ossad-border)" }}
        />

        <IconButton title="Search">
          <Search size={14} />
        </IconButton>

        <IconButton title="Alerts">
          <Bell size={14} />
        </IconButton>

        {/* Sign In */}
        <StatusBadge color="var(--ossad-accent)" colorRaw="54,123,240" asButton>
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
      className="flex items-center justify-center w-8 h-8 rounded-[3px] transition-colors duration-150 cursor-pointer hover:bg-white/3"
      style={{ color: "var(--ossad-text-secondary)" }}
      title={title}
    >
      {children}
    </button>
  );
}

function StatusBadge({
  color,
  colorRaw,
  asButton = false,
  children,
}: {
  color: string;
  colorRaw: string;
  asButton?: boolean;
  children: React.ReactNode;
}) {
  const style = {
    backgroundColor: `rgba(${colorRaw},0.06)`,
    border: `1px solid rgba(${colorRaw},0.18)`,
    color,
  };
  const cls =
    "flex items-center gap-1.5 px-2 py-1 rounded-[3px] text-[9px] font-mono tracking-[0.2em] uppercase flex-shrink-0";

  return asButton ? (
    <button className={cls} style={style}>
      {children}
    </button>
  ) : (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}
