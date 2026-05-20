"use client";

import Link from "next/link";
import type { Tool } from "@/lib/nav";
import { cn } from "@/lib/utils";

const ICON_SIZE = 18;

interface Props {
  tool: Tool;
  collapsed: boolean;
  active: boolean;
  /**
   * indented=true  → sub-tool under a toolkit dropdown (default)
   * indented=false → flat item at the same visual level as kit headers
   *                  (used for single-tool kits like Console)
   */
  indented?: boolean;
}

export default function SidebarToolItem({
  tool,
  collapsed,
  active,
  indented = true,
}: Props) {
  const Icon = tool.icon;

  const wrapperClass = !collapsed && indented
    ? "ml-7 mr-3 my-[1px]"
    : "mx-3 my-[1px]";

  return (
    <div className={wrapperClass}>
      <Link
        href={tool.href}
        title={collapsed ? tool.label : undefined}
        className={cn(
          "flex items-center transition-colors duration-150",
          collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon size={ICON_SIZE} className="flex-shrink-0" />
        {!collapsed && (
          <span className="flex-1 text-[13px] font-medium tracking-[0.02em] whitespace-nowrap overflow-hidden">
            {tool.label}
          </span>
        )}
      </Link>
    </div>
  );
}
