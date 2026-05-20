"use client";

import { CircleCheckBig } from "lucide-react";

// DATA REPRESENTATION
export type GraphNodeClass =
  | "nominal" // normal host with normal latency
  | "origin" // a special designated host usually representing the source or gateway
  | "cautious" // normal host with moderate performance loss e.g., 100-300ms latency
  | "warning" // normal host with high performance loss e.g., >300ms latency
  | "catastrophic" // no response or infinite loss e.g., dropped packet
  | "running"; // special node representing current unresolved state

export interface GraphNode {
  id: string; // e.g., TTL, IP
  superlabel?: string; // optional top label
  sublabel?: string; // optional bottom label
  class: GraphNodeClass; // primarily just for color coding (for now)
  weight?: string; // optional weight- used to draw the edge
}

export function class2Colour(nodeClass: GraphNodeClass): string {
  switch (nodeClass) {
    case "origin":
      return "var(--primary)";
    case "cautious":
      return "var(--color-amber-500)";
    case "warning":
      return "var(--destructive)";
    case "catastrophic":
      return "var(--destructive)";
    case "running":
      return "var(--color-emerald-500)";
    default:
      return "var(--muted-foreground)";
  }
}

// COMPONENTS
// should have size classes - graph size controlled at the Graph assembler layer
// eventually add a size prop
function GraphNodeUI({ node }: { node: GraphNode }) {
  const nodeColour = class2Colour(node.class);

  return (
    <div className="flex flex-col items-center gap-1.5 w-[72px]">
      {node.superlabel && (
        <div>
          <span
            className="text-[9px] font-mono tracking-widest uppercase truncate max-w-full text-center"
            style={{ color: "var(--muted-foreground)" }}
          >
            {node.superlabel}
          </span>
        </div>
      )}

      <div>
        <div
          className={`rounded-full w-3 h-3 shrink-0`}
          style={{
            backgroundColor: nodeColour,
          }}
        />
      </div>

      {node.sublabel && (
        <div>
          <span
            className="text-[9px] font-mono truncate max-w-full text-center"
            style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
          >
            {node.sublabel}
          </span>
        </div>
      )}
    </div>
  );
}

function GraphEdgeUI({
  nodeClass,
  weight,
}: {
  nodeClass: GraphNodeClass;
  weight: string | null;
}) {
  const edgeColour = class2Colour(nodeClass);

  return (
    <div className="flex flex-col items-center gap-1 w-[48px] justify-center relative">
      {weight && (
        <div className="absolute top-1.5">
          <span
            className="text-[8px] font-mono"
            style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
          >
            {weight}
          </span>
        </div>
      )}

      <div
        className="w-full h-[1px]"
        style={{ backgroundColor: edgeColour, opacity: 0.5 }}
      ></div>
    </div>
  );
}

function GraphDirectedEdgeUI() {
  return null;
}

function RunningNodeUI() {
  return (
    <div className="flex">
      <GraphEdgeUI nodeClass="running" weight={null} />
      <GraphNodeUI
        node={{
          id: "running",
          class: "running",
        }}
      />
    </div>
  );
}

export function CompletionIndicator() {
  return (
    <div
      className="w-[80px] flex justify-end items-center gap-1 pr-5"
      style={{ color: "var(--color-emerald-500)" }}
    >
      <span className="text-[9px] font-mono tracking-widest uppercase ">
        Done
      </span>
      <CircleCheckBig size={14} />
    </div>
  );
}

// LINE GRAPH
// used in trace route, ...
export function LineGraph({
  nodes,
  isRunning,
}: {
  nodes: GraphNode[];
  isRunning: boolean;
}) {
  return (
    <div className="flex items-center mx-auto">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex">
          {i > 0 && (
            <GraphEdgeUI nodeClass={node.class} weight={node.weight || null} />
          )}
          <GraphNodeUI node={node} />
        </div>
      ))}

      {/* {isRunning && <RunningNodeUI />}
      {!isRunning && <CompletionIndicator />} */}
    </div>
  );
}

// STAR GRAPH
// used in host map, ...

export function StarGraph({
  nodes,
  isRunning,
}: {
  nodes: GraphNode[];
  isRunning: boolean;
}) {
  const hosts = nodes.filter((node) => node.class !== "origin");
  const router = nodes.find((node) => node.class === "origin");

  const n = hosts.length;
  const radius = 250;
  const radius_multiplier = 0.66;
  const ox = 250; // router x-pos
  const oy = 250; // router y-pos

  // return stump later
  if (!router) return null;

  // general case
  return (
    <div className="relative w-[500px] h-[500px] m-auto">
      {/* router */}
      <div
        className="absolute"
        style={{
          left: `${ox - 36}px`,
          top: `${oy - 36}px`,
        }}
      >
        <GraphNodeUI node={router} />
      </div>

      {/* hosts */}
      {hosts.map((node, i) => {
        const angle = ((2 * Math.PI) / n) * i - Math.PI / 2;
        const px = ox + radius * radius_multiplier * Math.cos(angle);
        const py = oy + radius * radius_multiplier * Math.sin(angle);

        return (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: `${px - 36}px`,
              top: `${py - 36}px`,
            }}
          >
            <GraphNodeUI node={node} />
          </div>
        );
      })}

      {/* edges */}
      {hosts.map((node, i) => {
        const angle = ((2 * Math.PI) / n) * i - Math.PI / 2;
        const edgeOffset = (radius * radius_multiplier) / 4;

        return (
          <div
            key={i}
            className="absolute h-[1px]"
            style={{
              left: `${ox + edgeOffset * Math.cos(angle)}px`,
              top: `${oy + edgeOffset * Math.sin(angle)}px`,
              width: `${(radius * radius_multiplier) / 1.4 - edgeOffset}px`,
              transformOrigin: "left center",
              transform: `rotate(${angle * (180 / Math.PI)}deg)`,
              backgroundColor: class2Colour(node.class),
              opacity: 0.1,
            }}
          />
        );
      })}
    </div>
  );
}
