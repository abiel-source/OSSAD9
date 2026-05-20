"use client";

import { ChevronRight } from "lucide-react";
import SidebarToolItem from "@/components/layout/SidebarToolItem";
import type { Toolkit } from "@/lib/nav";
import { cn } from "@/lib/utils";

const KIT_ICON_SIZE = 18;

interface Props {
  kit: Toolkit;
  collapsed: boolean;
  expanded: boolean;
  onToggle: (id: string) => void;
  currentPath: string;
}

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
          className="flex items-center w-full gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Icon
            size={KIT_ICON_SIZE}
            className={cn(
              "flex-shrink-0",
              hasActiveChild ? "text-foreground" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "flex-1 text-left text-[11px] font-semibold tracking-[0.12em] uppercase whitespace-nowrap overflow-hidden",
              hasActiveChild ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {kit.label}
          </span>
          <ChevronRight
            size={11}
            className={cn(
              "flex-shrink-0 text-muted-foreground transition-transform duration-150",
              expanded ? "rotate-90" : "rotate-0"
            )}
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
