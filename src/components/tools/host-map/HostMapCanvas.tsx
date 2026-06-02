"use client";

import { DiscoveredHost } from "@/types/network";
import { GraphNode, StarGraph } from "@/lib/graph";
import { class2Colour } from "@/lib/graph";
import { useTopologyStore } from "@/store/topology";

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// FOR REFERENCE ONLY //////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
// export interface GraphNode {
//   id: string; // e.g., TTL, IP
//   superlabel?: string; // optional top label
//   sublabel?: string; // optional bottom label
//   class: GraphNodeClass; // primarily just for color coding (for now)
//   weight?: string; // optional weight- used to draw the edge
// }

// export interface DiscoveredHost {
//   id: string; // IP address (Firestore document ID)
//   ip: string;
//   hostname: string | null;
//   mac: string | null;
//   vendor: string | null;
//   latencyMs: number | null;
//   deviceType: DeviceType;
// }
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

export interface HostMapCanvasProps {
  nodes: DiscoveredHost[];
  isRunning: boolean;
}

// classify if discovered host is a router or not - the work of figuring out if a list of hosts is a router or not
// is done by filterGateway. We read latency & deviceType to translate what graph node class the device is for render.
function Host2Class(host: DiscoveredHost): GraphNode["class"] {
  if (host.deviceType === "router") return "origin";
  if (!host.latencyMs) return "nominal";

  // latency available
  if (host.latencyMs < 100) return "nominal";
  if (host.latencyMs < 300) return "cautious";
  if (host.latencyMs >= 300) return "warning";
  // unreachable branch - cannot tell between disconnected node and lack of latency information
  else return "catastrophic";
}

export function HostMapCanvas({ nodes, isRunning }: HostMapCanvasProps) {
  const { isPaused } = useTopologyStore();

  if (!isRunning && nodes.length === 0) {
    return (
      <div className="flex flex-col pb-[26px] mb-5 border border-border bg-card">
        {/* HEADER */}
        <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between px-4 py-2 gap-2">
          {/* header group 1 LEFT */}
          <div className="flex items-center gap-2">
            <div
              className="rounded-full w-2 h-2 shrink-0"
              style={{ backgroundColor: class2Colour("cautious") }}
            />
            <span
              className="text-[12px]"
              style={{ color: class2Colour("cautious"), opacity: 0.66 }}
            >
              idle
            </span>
          </div>
          {/* header group 2 RIGHT */}
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-mono text-muted-foreground/60">
              hosts [0]
            </span>
            <span className="text-[12px] font-mono text-muted-foreground/60">
              latency [0.00ms]
            </span>
            <span className="text-[12px] font-mono text-muted-foreground/60">
              topology [none]
            </span>
          </div>
        </div>

        {/* CANVAS */}
        <div className="w-full flex items-center justify-center" style={{ minHeight: "400px" }}>
          <span className="text-[12px] text-muted-foreground/40">
            Run map to visualize the network topology
          </span>
        </div>
      </div>
    );
  }

  // compute running stats
  const runningHosts = nodes.length;

  const numericalLatencies = nodes
    .map((n) => n.latencyMs)
    .filter((l): l is number => l !== null);

  const runningLatency =
    numericalLatencies.length > 0
      ? (
          numericalLatencies.reduce((a, b) => a + b, 0) /
          numericalLatencies.length
        ).toFixed(2)
      : "0.00";

  const layout =
    runningHosts === 0
      ? "none"
      : runningHosts === 1
      ? "singleton"
      : runningHosts === 2
      ? "line"
      : "star";

  // GraphNode accepts possible undefined whereas DiscoveredHost accepts possible nulls
  // im going to leave the interface patterns b/c I want DiscoveredHost to be explicitly compatible with Firebase
  const graphNodes: GraphNode[] = nodes.map((node) => {
    const nodeClass = Host2Class(node);

    return {
      id: node.id,
      superlabel: node.ip ?? undefined,
      sublabel: `${node.hostname ? `${node.hostname} | ` : ""}${
        nodeClass ?? ""
      }`,
      class: nodeClass,
      weight: node.latencyMs?.toString() ?? undefined,
    };
  });

  const statusColour = !isRunning
    ? class2Colour("running")
    : isPaused
    ? class2Colour("cautious")
    : "var(--primary)";

  return (
    <div className="flex flex-col pb-[26px] mb-5 border border-border bg-card">
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
            className="text-[12px]"
            style={{ color: statusColour, opacity: 0.66 }}
          >
            {!isRunning ? "done" : isPaused ? "paused" : "mapping"}
          </span>
        </div>

        {/* header group 2 RIGHT */}
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-mono text-muted-foreground/60">
            hosts [{runningHosts}]
          </span>
          <span className="text-[12px] font-mono text-muted-foreground/60">
            latency [{runningLatency}ms]
          </span>
          <span className="text-[12px] font-mono text-muted-foreground/60">
            topology [{layout}]
          </span>
        </div>
      </div>

      {/* CANVAS */}
      <div className="w-full overflow-x-auto flex" style={{ minHeight: "400px" }}>
        <StarGraph nodes={graphNodes} isRunning={isRunning} />
      </div>
    </div>
  );
}
