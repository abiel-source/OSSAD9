"use client";

import { useEffect, useRef } from "react";
import { useTopologyStore } from "@/store/topology";
import type { LogLevel } from "@/types/network";

const LEVEL_COLORS: Record<LogLevel, string> = {
  info: "var(--muted-foreground)",
  success: "var(--color-emerald-500)",
  warning: "var(--color-amber-500)",
  error: "var(--destructive)",
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function ScanLog() {
  const logs = useTopologyStore((s) => s.logs);
  const isScanning = useTopologyStore((s) => s.isScanning);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col border border-border overflow-hidden mb-5 p-4 gap-3 bg-card">
      {/* HEADER */}
      <div className="flex items-center flex-shrink-0">
        <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
          Scan Log
        </span>
      </div>

      {/* SCAN ENTRIES */}
      <div
        ref={scrollRef}
        className="h-32 overflow-y-auto px-3 py-2 space-y-1 border border-border bg-background"
      >
        {logs.length === 0 ? (
          <p className="text-[12px] text-center mt-6 text-border">
            No scan running
          </p>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <span className="text-[12px] font-mono flex-shrink-0 mt-px tabular-nums text-muted-foreground">
                {formatTime(entry.timestamp)}
              </span>
              <span
                className="text-[12px] font-mono leading-relaxed break-all"
                style={{ color: LEVEL_COLORS[entry.level] }}
              >
                {entry.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
