"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radar } from "lucide-react";
import SidebarToolkit from "@/components/layout/SidebarToolkit";
import SidebarToolItem from "@/components/layout/SidebarToolItem";
import {
  PRIMARY_KITS,
  SUPPORT_KITS,
  ALL_KITS,
  OVERVIEW_ITEM,
  CONSOLE_TOOL,
} from "@/lib/nav";
import { useUIStore } from "@/store/ui";

// Constants
const OVERVIEW_ICON_SIZE = 18;

// Divider
function NavDivider() {
  return (
    <div
      className="mx-3 my-3"
      style={{ height: "1px", backgroundColor: "var(--ossad-border)" }}
    />
  );
}

// Sidebar
export default function Sidebar() {
  const { sidebarCollapsed, sidebarOpen, closeSidebar } = useUIStore();
  const pathname = usePathname();

  // Mobile drawer being open always overrides the desktop collapsed state,
  // so the drawer always renders full icons + labels.
  const effectivelyCollapsed = sidebarCollapsed && !sidebarOpen;

  // All kits start expanded
  const [expandedKits, setExpandedKits] = useState<Set<string>>(
    () => new Set(ALL_KITS.map((kit) => kit.id))
  );

  // Auto-expand the kit that owns the active route
  useEffect(() => {
    const activeKit = ALL_KITS.find((kit) =>
      kit.tools.some((tool) => pathname === tool.href)
    );
    if (activeKit && !expandedKits.has(activeKit.id)) {
      setExpandedKits((prev) => new Set([...prev, activeKit.id]));
    }
  }, [pathname]);

  // Close mobile drawer on any navigation
  useEffect(() => {
    closeSidebar();
  }, [pathname]);

  const toggleKit = (id: string) => {
    setExpandedKits((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isOverviewActive = pathname === OVERVIEW_ITEM.href;

  // Layout
  return (
    <aside
      className={[
        "flex flex-col h-screen overflow-hidden flex-shrink-0",
        // Mobile: fixed overlay, controlled by sidebarOpen
        "fixed top-0 left-0 z-50",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: in-flow, always visible, translate reset
        "lg:relative lg:z-auto lg:translate-x-0",
        "transition-all duration-200 ease-in-out",
        "w-[240px]",
        effectivelyCollapsed
          ? "lg:w-[60px] lg:min-w-[60px]"
          : "lg:w-[240px] lg:min-w-[240px]",
      ].join(" ")}
      style={{
        backgroundColor: "var(--ossad-bg-surface)",
        borderRight: "1px solid var(--ossad-border)",
      }}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-12 flex-shrink-0 ${
          effectivelyCollapsed ? "justify-center pr-[4px]" : "gap-3 px-6"
        }`}
        style={{ borderBottom: "1px solid var(--ossad-border)" }}
      >
        <Radar
          size={18}
          className="flex-shrink-0"
          style={{ color: "var(--ossad-accent)" }}
        />
        {!effectivelyCollapsed && (
          <span
            className="text-[11px] font-bold tracking-[0.22em] uppercase whitespace-nowrap"
            style={{ color: "var(--ossad-accent)" }}
          >
            OSSAD-9
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Overview */}
        <div className="mx-3 my-[1px]">
          <Link
            href={OVERVIEW_ITEM.href}
            title={effectivelyCollapsed ? OVERVIEW_ITEM.label : undefined}
            className={`flex items-center rounded-[3px] transition-colors duration-150 ${
              effectivelyCollapsed
                ? "justify-center py-2.5"
                : "gap-3 px-3 py-2.5"
            } ${
              isOverviewActive
                ? "bg-[var(--ossad-accent-glow)]"
                : "hover:bg-white/3"
            }`}
          >
            <OVERVIEW_ITEM.icon
              size={OVERVIEW_ICON_SIZE}
              className="flex-shrink-0"
              style={{
                color: isOverviewActive
                  ? "var(--ossad-accent)"
                  : "var(--ossad-text-dim)",
              }}
            />
            {!effectivelyCollapsed && (
              <span
                className="flex-1 text-[13px] font-medium tracking-[0.02em] whitespace-nowrap overflow-hidden"
                style={{
                  color: isOverviewActive
                    ? "var(--ossad-accent)"
                    : "var(--ossad-text-dim)",
                }}
              >
                {OVERVIEW_ITEM.label}
              </span>
            )}
          </Link>
        </div>

        {/* Primary toolkits */}
        {PRIMARY_KITS.map((kit) => (
          <SidebarToolkit
            key={kit.id}
            kit={kit}
            collapsed={effectivelyCollapsed}
            expanded={expandedKits.has(kit.id)}
            onToggle={toggleKit}
            currentPath={pathname}
          />
        ))}

        {/* Console — standalone tool, no dropdown */}
        <SidebarToolItem
          tool={CONSOLE_TOOL}
          collapsed={effectivelyCollapsed}
          active={CONSOLE_TOOL.href === pathname}
          indented={false}
        />

        {/* Divider between primary and support groups */}
        <NavDivider />

        {/* Support toolkits */}
        {SUPPORT_KITS.map((kit) => (
          <SidebarToolkit
            key={kit.id}
            kit={kit}
            collapsed={effectivelyCollapsed}
            expanded={expandedKits.has(kit.id)}
            onToggle={toggleKit}
            currentPath={pathname}
          />
        ))}
      </nav>
    </aside>
  );
}
