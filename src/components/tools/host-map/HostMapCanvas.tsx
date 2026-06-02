"use client";

import { DiscoveredHost } from "@/types/network";
import { GraphNode, StarGraph } from "@/lib/graph";
import { class2Colour } from "@/lib/graph";
import { useTopologyStore } from "@/store/topology";

export interface HostMapCanvasProps {
  nodes: DiscoveredHost[];
  isRunning: boolean;
}

// NOTE: classify if discovered host is a router or not - the work of figuring out if a list of hosts is a router or not
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

  // NOTE: GraphNode accepts possible undefined whereas DiscoveredHost accepts possible nulls
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

  return (
    <Canvas
      graphNodes={graphNodes}
      isRunning={isRunning}
      isPaused={isPaused}
      runningHosts={runningHosts}
      runningLatency={runningLatency}
    />
  );
}

function Canvas({
  graphNodes,
  isRunning,
  isPaused,
  runningHosts,
  runningLatency,
}: {
  graphNodes: GraphNode[];
  isRunning: boolean;
  isPaused: boolean;
  runningHosts: number;
  runningLatency: string;
}) {
  const layout =
    runningHosts === 0
      ? "none"
      : runningHosts === 1
        ? "singleton"
        : runningHosts === 2
          ? "line"
          : "star";

  // WARNING: initial state could be mistaken for mapping 0 hosts (failed map or no network)
  // instead of displaying idle state we should display the case of a potential failed mapping
  const isInitialState = !isRunning && runningHosts === 0;

  const statusColour = isInitialState
    ? class2Colour("cautious") // initial state
    : !isRunning
      ? class2Colour("running") // complete
      : isPaused
        ? class2Colour("cautious") // running but paused
        : "var(--primary)"; // running

  return (
    <div className="flex flex-col flex-1 pb-[26px] border border-border bg-card">
      {/* Header */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between px-4 py-2 gap-2">
        {/* Left header group */}
        <div className="flex items-center gap-2">
          <div
            className="rounded-full w-2 h-2 shrink-0"
            style={{
              backgroundColor: statusColour,
              animation:
                isRunning && !isPaused
                  ? "flash 0.33s ease-in-out infinite"
                  : "",
            }}
          />
          <span
            className="text-[12px]"
            style={{ color: statusColour, opacity: 0.66 }}
          >
            {isInitialState
              ? "idle"
              : !isRunning
                ? "done"
                : isPaused
                  ? "paused"
                  : "mapping"}
          </span>
        </div>

        {/* Right header group */}
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

      {/* Canvas */}
      {isInitialState ? (
        <div className="w-full flex items-center justify-center h-[500px]">
          <span className="text-[12px] text-muted-foreground/40">
            Run map to visualize the network topology
          </span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto flex h-[500px]">
          <StarGraph nodes={graphNodes} isRunning={isRunning} />
        </div>
      )}
    </div>
  );
}
