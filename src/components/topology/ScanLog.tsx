"use client";

import { useEffect, useRef } from "react";
import { useTopologyStore } from "@/store/topology";
import type { LogLevel } from "@/types/network";

const LEVEL_COLORS: Record<LogLevel, string> = {
  info: "var(--ossad-text-secondary)",
  success: "var(--ossad-online)",
  warning: "var(--ossad-cautious)",
  error: "var(--ossad-catastrophic)",
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
    <div
      className="flex flex-col rounded-[3px] border overflow-hidden mb-6 p-4 gap-3"
      style={{
        backgroundColor: "var(--ossad-bg-surface)",
        borderColor: "var(--ossad-border)",
      }}
    >
      {/* HEADER */}
      <div className="flex items-center flex-shrink-0">
        <span
          className="text-[10px] font-mono tracking-[0.16em] uppercase"
          style={{ color: "var(--ossad-text-secondary)" }}
        >
          Scan Log
        </span>
      </div>

      {/* SCAN ENTRIES */}
      <div
        ref={scrollRef}
        className="h-32 overflow-y-auto px-3 py-2 space-y-1"
        style={{
          border: "1px solid var(--ossad-border)",
          backgroundColor: "var(--ossad-bg-elevated)",
        }}
      >
        {logs.length === 0 ? (
          <p
            className="text-[11px] font-mono text-center mt-8"
            style={{ color: "var(--ossad-border)" }}
          >
            No scan running
          </p>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2">
              <span
                className="text-[10px] font-mono flex-shrink-0 mt-px tabular-nums"
                style={{ color: "var(--ossad-text-secondary)" }}
              >
                {formatTime(entry.timestamp)}
              </span>
              <span
                className="text-[10px] font-mono leading-relaxed break-all"
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
