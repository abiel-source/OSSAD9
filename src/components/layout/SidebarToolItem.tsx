"use client";

import Link from "next/link";
import type { Tool } from "@/lib/nav";

// Constants
const ICON_SIZE = 18;
const ICON_COLOR_INACTIVE = "var(--ossad-text-dim)";
const ICON_COLOR_ACTIVE = "var(--ossad-accent)";
const TEXT_COLOR_INACTIVE = "var(--ossad-text-dim)";
const TEXT_COLOR_ACTIVE = "var(--ossad-accent)";

// Props
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

// Component
export default function SidebarToolItem({
  tool,
  collapsed,
  active,
  indented = true,
}: Props) {
  const Icon = tool.icon;

  // Indent lives on the wrapper div — margin/padding on <a> is unreliable
  const wrapperClass = !collapsed && indented
    ? "ml-7 mr-3 my-[1px]"   // shifted right for sub-tool indent
    : "mx-3 my-[1px]";

  return (
    <div className={wrapperClass}>
      <Link
        href={tool.href}
        title={collapsed ? tool.label : undefined}
        className={`flex items-center rounded-[3px] transition-colors duration-150 ${
          collapsed
            ? "justify-center py-2.5"
            : "gap-3 px-3 py-2.5"
        } ${active ? "bg-[var(--ossad-accent-glow)]" : "hover:bg-white/3"}`}
      >
        <Icon
          size={ICON_SIZE}
          className="flex-shrink-0"
          style={{ color: active ? ICON_COLOR_ACTIVE : ICON_COLOR_INACTIVE }}
        />
        {!collapsed && (
          <span
            className="flex-1 text-[13px] font-medium tracking-[0.02em] whitespace-nowrap overflow-hidden"
            style={{ color: active ? TEXT_COLOR_ACTIVE : TEXT_COLOR_INACTIVE }}
          >
            {tool.label}
          </span>
        )}
      </Link>
    </div>
  );
}
