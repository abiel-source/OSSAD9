"use client";

import { Hop } from "./types";
import { LineGraph, GraphNode, GraphNodeClass } from "@/lib/graph";
import { class2Colour } from "@/lib/graph";
import { useRouteTraceStore } from "@/store/routetrace";

interface TraceCanvasProps {
  hops: Hop[];
  isRunning: boolean;
}

export default function TraceCanvas({ hops, isRunning }: TraceCanvasProps) {
  const { isPaused } = useRouteTraceStore();

  if (!isRunning && hops.length === 0) {
    return (
      <div className="flex flex-col mb-5 pb-[26px] border border-border bg-card">
        {/* HEADER */}
        <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between px-4 py-2 gap-2">
          {/* header group 1 LEFT */}
          <div className="flex items-center gap-2">
            <div
              className="rounded-full w-2 h-2 shrink-0"
              style={{ backgroundColor: class2Colour("cautious") }}
            />
            <span
              className="text-[12px] tracking-[0.1em]"
              style={{ color: class2Colour("cautious"), opacity: 0.66 }}
            >
              idle
            </span>
          </div>

          {/* header group 2 RIGHT */}
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-mono tracking-[0.1em] text-muted-foreground/60">
              hops [0]
            </span>
            <span className="text-[12px] font-mono tracking-[0.1em] text-muted-foreground/60">
              latency [0.00ms]
            </span>
            <span className="text-[12px] font-mono tracking-[0.1em] text-muted-foreground/60">
              packet loss [0.00%]
            </span>
          </div>
        </div>

        {/* EMPTY CANVAS */}
        <div className="w-full flex items-center justify-center" style={{ height: "144px" }}>
          <span className="text-[12px] tracking-[0.1em] text-muted-foreground/60">
            Run a trace to visualize the path
          </span>
        </div>
      </div>
    );
  }

  // compute running stats
  const runningHops = hops.length;

  const numericalRtts = hops
    .flatMap((h) => h.rtts)
    .filter((r): r is number => r !== null);
  const runningRtts =
    numericalRtts.length > 0
      ? (
          numericalRtts.reduce((a, b) => a + b, 0) / numericalRtts.length
        ).toFixed(2)
      : "0.00";

  const allRtts = hops.flatMap((h) => h.rtts);
  const runningPacketLoss =
    allRtts.length > 0
      ? (
          (allRtts.filter((r) => r === null).length / allRtts.length) *
          100
        ).toFixed(2)
      : "0.00";

  // prepare for graph library
  const graphNodes: GraphNode[] = [
    { id: "source", superlabel: "Source", sublabel: "You", class: "origin" },
    ...hops.map((hop) => ({
      id: `hop-${hop.ttl}`,
      superlabel: `Hop ${hop.ttl}`,
      sublabel: hop.ip ?? "*",
      class: classifyRTT(hop) as GraphNodeClass,
      weight: avgRTT(hop) !== null ? `${avgRTT(hop)}ms` : undefined,
    })),
  ];

  const statusColour = !isRunning
    ? class2Colour("running")
    : isPaused
    ? class2Colour("cautious")
    : "var(--primary)";

  return (
    <div className="flex flex-col mb-5 pb-[26px] border border-border bg-card">
      {/* HEADER */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between px-4 py-2 gap-2">
        {/* header group 1 LEFT */}
        <div className="flex items-center gap-2">
          <div
            className="rounded-full w-2 h-2 shrink-0"
            style={{
              backgroundColor: statusColour,
              animation: isRunning && !isPaused ? "flash 0.33s ease-in-out infinite" : "",
            }}
          />
          <span
            className="text-[12px] tracking-[0.1em]"
            style={{ color: statusColour, opacity: 0.66 }}
          >
            {!isRunning ? "done" : isPaused ? "paused" : "tracing"}
          </span>
        </div>

        {/* header group 2 RIGHT */}
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-mono tracking-[0.1em] text-muted-foreground/60">
            hops [{runningHops}]
          </span>
          <span className="text-[12px] font-mono tracking-[0.1em] text-muted-foreground/60">
            latency [{runningRtts}ms]
          </span>
          <span className="text-[12px] font-mono tracking-[0.1em] text-muted-foreground/60">
            packet loss [{runningPacketLoss}%]
          </span>
        </div>
      </div>

      {/* CANVAS */}
      <div className="w-full overflow-x-auto flex" style={{ height: "144px" }}>
        <LineGraph nodes={graphNodes} isRunning={isRunning} />
      </div>
    </div>
  );
}

function avgRTT(hop: Hop): number | null {
  const valid = hop.rtts.filter((r) => r !== null) as number[];
  if (valid.length === 0) return null;

  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  return parseFloat(avg.toFixed(2));
}

function classifyRTT(hop: Hop): GraphNodeClass {
  const avg = avgRTT(hop);
  if (avg === null) return "catastrophic";
  if (avg < 100) return "nominal";
  if (avg < 300) return "cautious";
  return "warning"; // >=300ms
}
