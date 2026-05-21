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
import { cn } from "@/lib/utils";

const OVERVIEW_ICON_SIZE = 15;

function NavDivider() {
  return <div className="mx-3 my-3 h-px bg-border" />;
}

export default function Sidebar() {
  const { sidebarCollapsed, sidebarOpen, closeSidebar } = useUIStore();
  const pathname = usePathname();

  const effectivelyCollapsed = sidebarCollapsed && !sidebarOpen;

  const [expandedKits, setExpandedKits] = useState<Set<string>>(
    () => new Set(ALL_KITS.map((kit) => kit.id))
  );

  useEffect(() => {
    const activeKit = ALL_KITS.find((kit) =>
      kit.tools.some((tool) => pathname === tool.href)
    );
    if (activeKit && !expandedKits.has(activeKit.id)) {
      setExpandedKits((prev) => new Set([...prev, activeKit.id]));
    }
  }, [pathname]);

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

  return (
    <aside
      className={cn(
        "flex flex-col h-screen overflow-hidden flex-shrink-0",
        "fixed top-0 left-0 z-50",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:relative lg:z-auto lg:translate-x-0",
        "transition-all duration-200 ease-in-out",
        "w-[240px]",
        effectivelyCollapsed ? "lg:w-[56px] lg:min-w-[56px]" : "lg:w-[240px] lg:min-w-[240px]",
        "bg-sidebar border-r border-sidebar-border"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-14 flex-shrink-0 border-b border-sidebar-border",
          effectivelyCollapsed ? "justify-center" : "gap-3 px-5"
        )}
      >
        <Radar size={16} className="flex-shrink-0 text-foreground" />
        {!effectivelyCollapsed && (
          <span className="text-[12px] font-bold tracking-[0.22em] uppercase whitespace-nowrap text-foreground font-heading">
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
            className={cn(
              "flex items-center transition-colors duration-150",
              effectivelyCollapsed ? "justify-center py-2" : "gap-2.5 px-3 py-2",
              isOverviewActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <OVERVIEW_ITEM.icon size={OVERVIEW_ICON_SIZE} className="flex-shrink-0" />
            {!effectivelyCollapsed && (
              <span className="flex-1 text-[13px] font-medium tracking-[0.02em] whitespace-nowrap overflow-hidden">
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
