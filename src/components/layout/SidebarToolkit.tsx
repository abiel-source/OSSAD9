"use client";

import { ChevronRight } from "lucide-react";
import SidebarToolItem from "@/components/layout/SidebarToolItem";
import type { Toolkit } from "@/lib/nav";

// Constants
const KIT_ICON_SIZE = 18;
const KIT_ICON_COLOR = "var(--ossad-text-secondary)";
const KIT_ICON_HAS_ACTIVE = "var(--ossad-text-dim)";

// Props
interface Props {
  kit: Toolkit;
  collapsed: boolean;
  expanded: boolean;
  onToggle: (id: string) => void;
  currentPath: string;
}

// Component
export default function SidebarToolkit({
  kit,
  collapsed,
  expanded,
  onToggle,
  currentPath,
}: Props) {
  const Icon = kit.icon;
  const hasActiveChild = kit.tools.some((t) => t.href === currentPath);

  // Collapsed mode: flat icons, no kit header
  if (collapsed) {
    return (
      <>
        {kit.tools.map((tool) => (
          <SidebarToolItem
            key={tool.id}
            tool={tool}
            collapsed={true}
            active={tool.href === currentPath}
          />
        ))}
      </>
    );
  }

  // Expanded mode
  return (
    <div>
      {/* Kit header — dropdown toggle, NOT a nav link */}
      <div className="mx-3 my-[1px]">
        <button
          type="button"
          onClick={() => onToggle(kit.id)}
          title={kit.label}
          className="flex items-center w-full gap-3 px-3 py-2.5 rounded-[3px] transition-colors duration-150 hover:bg-white/3"
        >
          <Icon
            size={KIT_ICON_SIZE}
            className="flex-shrink-0"
            style={{ color: hasActiveChild ? KIT_ICON_HAS_ACTIVE : KIT_ICON_COLOR }}
          />
          <span
            className="flex-1 text-left text-[11px] font-semibold tracking-[0.12em] uppercase whitespace-nowrap overflow-hidden"
            style={{ color: hasActiveChild ? "var(--ossad-text-dim)" : "var(--ossad-text-secondary)" }}
          >
            {kit.label}
          </span>
          <ChevronRight
            size={11}
            className="flex-shrink-0"
            style={{
              color: "var(--ossad-text-secondary)",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 150ms ease",
            }}
          />
        </button>
      </div>

      {/* Tool list */}
      {expanded && kit.tools.length > 0 && (
        <div className="pb-1">
          {kit.tools.map((tool) => (
            <SidebarToolItem
              key={tool.id}
              tool={tool}
              collapsed={false}
              active={tool.href === currentPath}
              indented={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
