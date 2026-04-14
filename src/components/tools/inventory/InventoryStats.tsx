"use client";

import { InventoryItem } from "@/types/network";

interface InventoryStatsProps {
  filtered: InventoryItem[];
}

// Latency histogram — buckets devices by latency range
function LatencyHistogram({ filtered }: InventoryStatsProps) {
  const buckets = [
    { label: "0-5", min: 0, max: 5 },
    { label: "5-10", min: 5, max: 10 },
    { label: "10-20", min: 10, max: 20 },
    { label: "20-50", min: 20, max: 50 },
    { label: "50+", min: 50, max: Infinity },
  ];

  const counts = buckets.map(
    (b) =>
      filtered.filter(
        (item) =>
          item.latencyMs !== null &&
          item.latencyMs >= b.min &&
          item.latencyMs < b.max
      ).length
  );

  const max = Math.max(...counts, 1);

  return (
    <GraphCard title="Latency Distribution (ms)">
      <div className="flex items-end gap-1 h-24">
        {buckets.map((b, i) => (
          <div key={b.label} className="flex flex-col items-center flex-1 gap-1">
            <span
              className="text-[8px] font-mono"
              style={{ color: "var(--ossad-text-secondary)" }}
            >
              {counts[i]}
            </span>
            <div
              className="w-full rounded-t-[2px] transition-all duration-300"
              style={{
                height: `${(counts[i] / max) * 100}%`,
                minHeight: counts[i] > 0 ? "4px" : "1px",
                backgroundColor:
                  counts[i] > 0
                    ? "rgba(54,123,240,0.5)"
                    : "rgba(54,123,240,0.1)",
              }}
            />
            <span
              className="text-[8px] font-mono"
              style={{ color: "var(--ossad-text-secondary)", opacity: 0.66 }}
            >
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </GraphCard>
  );
}

// Scatterplot — latency vs avg RTT per device
function LatencyRttScatter({ filtered }: InventoryStatsProps) {
  const points = filtered
    .map((item) => {
      if (item.latencyMs === null || !item.rtts) return null;
      const valid = item.rtts.filter((r): r is number => r !== null);
      if (valid.length === 0) return null;
      const avgRtt = valid.reduce((a, b) => a + b, 0) / valid.length;
      return { x: item.latencyMs, y: avgRtt, conflict: item.conflict !== null };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const maxX = Math.max(...points.map((p) => p.x), 1);
  const maxY = Math.max(...points.map((p) => p.y), 1);

  return (
    <GraphCard title="Latency vs Avg RTT">
      <div
        className="relative h-24 w-full"
        style={{
          borderLeft: "1px solid var(--ossad-border)",
          borderBottom: "1px solid var(--ossad-border)",
        }}
      >
        {points.length === 0 && (
          <span
            className="absolute inset-0 flex items-center justify-center text-[9px] font-mono"
            style={{ color: "var(--ossad-text-secondary)", opacity: 0.4 }}
          >
            no overlapping data
          </span>
        )}
        {points.map((p, i) => (
          <div
            key={i}
            className="absolute w-[5px] h-[5px] rounded-full transition-all duration-300"
            style={{
              left: `${(p.x / maxX) * 95}%`,
              bottom: `${(p.y / maxY) * 90}%`,
              backgroundColor: p.conflict
                ? "var(--ossad-catastrophic)"
                : "rgba(54,123,240,0.7)",
            }}
          />
        ))}
        {/* axis labels */}
        <span
          className="absolute text-[7px] font-mono"
          style={{
            bottom: "-14px",
            right: "0",
            color: "var(--ossad-text-secondary)",
            opacity: 0.5,
          }}
        >
          latency
        </span>
        <span
          className="absolute text-[7px] font-mono"
          style={{
            top: "-2px",
            left: "-4px",
            color: "var(--ossad-text-secondary)",
            opacity: 0.5,
            transform: "rotate(-90deg) translateX(-100%)",
            transformOrigin: "top left",
          }}
        >
          rtt
        </span>
      </div>
    </GraphCard>
  );
}

// Source breakdown — horizontal stacked bar
function SourceBreakdown({ filtered }: InventoryStatsProps) {
  const counts = {
    hostmap: filtered.filter((i) => i.sources.includes("hostmap")).length,
    routetrace: filtered.filter((i) => i.sources.includes("routetrace")).length,
    arp: filtered.filter((i) => i.sources.includes("arp")).length,
  };

  const total = filtered.length || 1;

  const segments: { key: string; count: number; color: string }[] = [
    { key: "hostmap", count: counts.hostmap, color: "rgba(54,123,240,0.6)" },
    { key: "routetrace", count: counts.routetrace, color: "rgba(139,92,246,0.6)" },
    { key: "arp", count: counts.arp, color: "rgba(34,197,94,0.6)" },
  ];

  return (
    <GraphCard title="Source Breakdown">
      <div className="flex flex-col gap-2">
        {/* stacked bar */}
        <div
          className="flex h-6 w-full rounded-[2px] overflow-hidden"
          style={{ backgroundColor: "var(--ossad-bg-elevated)" }}
        >
          {segments.map((seg) => (
            <div
              key={seg.key}
              className="h-full transition-all duration-300"
              style={{
                width: `${(seg.count / total) * 100}%`,
                backgroundColor: seg.color,
              }}
            />
          ))}
        </div>

        {/* legend */}
        <div className="flex gap-3 flex-wrap">
          {segments.map((seg) => (
            <div key={seg.key} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span
                className="text-[9px] font-mono"
                style={{ color: "var(--ossad-text-secondary)" }}
              >
                {seg.key} ({seg.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </GraphCard>
  );
}

// Shared card wrapper
function GraphCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex-1 min-w-0 p-3 rounded-[3px]"
      style={{
        border: "1px solid var(--ossad-border)",
        backgroundColor: "var(--ossad-bg-surface)",
      }}
    >
      <span
        className="text-[9px] font-mono tracking-[0.1em] uppercase block mb-3"
        style={{ color: "var(--ossad-text-secondary)", opacity: 0.66 }}
      >
        {title}
      </span>
      {children}
    </div>
  );
}

export function InventoryStats({ filtered }: InventoryStatsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <LatencyHistogram filtered={filtered} />
      <LatencyRttScatter filtered={filtered} />
      <SourceBreakdown filtered={filtered} />
    </div>
  );
}
