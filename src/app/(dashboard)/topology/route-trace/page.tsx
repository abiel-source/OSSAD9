"use client";

import ToolHeader from "@/components/ui/ToolHeader";
import { Milestone } from "lucide-react";
import TraceInputs, {
  TraceConfig,
} from "@/components/tools/route-trace/TraceInputs";
import TraceCanvas from "@/components/tools/route-trace/TraceCanvas";
import TraceDetails from "@/components/tools/route-trace/TraceDetails";
import { useRouteTraceStore } from "@/store/routetrace";
import { Hop } from "@/types/network";

const COMPLIANCES = ["RFC 792", "RFC 1393", "RFC 2544", "RFC 4443"];

export default function RouteTracePage() {
  const { hops, isRunning, appendHops, setIsRunning, reset } =
    useRouteTraceStore();

  const handleTrace = async (target: string) => {
    if (isRunning || !target.trim()) return;

    reset();
    setIsRunning(true);

    const url = `/api/topology/trace?target=${encodeURIComponent(target.trim())}`;

    try {
      const res = await fetch(url);
      if (!res.ok || !res.body) {
        const msg = await res.text();
        console.log(msg);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // decoded string looks like: data: {"ttl":1,"ip":"192.168.1.1",...}\n\ndata: {"ttl":2,"ip":"10.0.0.1",...}\n\n
        buffer += decoder.decode(value, { stream: true });

        // split buffer on double newline looks like:
        // [
        //   'data: {"ttl":1,"ip":"192.168.1.1",...}',
        //   'data: {"ttl":2,"ip":"10.0.0.1",...}',
        //   ''
        // ]
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? ""; // save last chunk if incomplete

        for (const part of parts) {
          // NOTE: the data line is the only line that is sent by /api/topology/trace
          // but a future update will cleanly separate event types: log and hop_traced
          const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          try {
            const hop: Hop = JSON.parse(dataLine.slice(5).trim());
            appendHops([hop]);
          } catch {
            // Skip malformed chunk in case of incompleteness
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.log("Error: " + (err?.message ?? "Unknown error"));
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleRun = (config: TraceConfig) => {
    // TODO: lift other config options to the api as specified
    handleTrace(config.target);
  };

  return (
    <div>
      <ToolHeader
        title="Route Trace"
        description="Map the hop-by-hop path packets take to a target host"
        icon={Milestone}
        rfcBadges={COMPLIANCES}
        onExportJSON={() => console.log("export json")}
        onExportCSV={() => console.log("export csv")}
        onLoadFromProject={() => console.log("load")}
        onSaveToProject={() => console.log("save")}
      />
      <TraceInputs isRunning={isRunning} onRun={handleRun} onReset={reset} />
      <TraceCanvas hops={hops} isRunning={isRunning} />
      <TraceDetails hops={hops} />
    </div>
  );
}
