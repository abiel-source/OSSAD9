"use client";

import ToolHeader from "@/components/ui/ToolHeader";
import { GitBranch } from "lucide-react";
import {
  ArpInspectInputs,
  ArpInspectConfig,
} from "@/components/tools/arp-inspect/ArpInspectInputs";
import { ArpInspectDetails } from "@/components/tools/arp-inspect/ArpInspectDetails";
import { useArpStore } from "@/store/arp";
import type { ArpEntry } from "@/types/network";

const COMPLIANCES = ["RFC 826", "RFC 5227", "RFC 7042", "RFC 1122"];

export default function ArpMapPage() {
  const { entries, isRunning, appendEntries, setIsRunning, reset } =
    useArpStore();

  const handleArp = async (cidr: string) => {
    if (isRunning || !cidr.trim()) return;

    reset();
    setIsRunning(true);

    const url = `/api/topology/inspect?cidr=${encodeURIComponent(cidr.trim())}`;

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

        // decoded string looks like: data: {"ip":"192.168.1.5","mac":"aa:bb:cc:dd:ee:ff",...}\n\ndata: {"ip":"192.168.1.6","mac":"11:22:33:44:55:66",...}\n\n
        buffer += decoder.decode(value, { stream: true });

        // split buffer on double newline looks like:
        // [
        //   'data: {"ip":"192.168.1.5","mac":"aa:bb:cc:dd:ee:ff",...}',
        //   'data: {"ip":"192.168.1.6","mac":"11:22:33:44:55:66",...}',
        //   ''
        // ]
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? ""; // save last chunk if incomplete

        for (const part of parts) {
          // NOTE: the data line is the only line that is sent by /api/topology/inspect
          // but a future update will cleanly separate event types: log, arp_entry, and arp_cache
          const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          try {
            const entry: ArpEntry = JSON.parse(dataLine.slice(5).trim());
            appendEntries([entry]);
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

  const handleRun = (config: ArpInspectConfig) => {
    handleArp(config.target);
  };

  return (
    <div>
      <ToolHeader
        title="ARP / Layer 2 Inspector"
        description="MAC-to-IP mapping, OUI vendor resolution, and Layer 2 conflict detection across the local subnet."
        icon={GitBranch}
        rfcBadges={COMPLIANCES}
        onExportJSON={() => console.log("export json")}
        onExportCSV={() => console.log("export csv")}
        onLoadFromProject={() => console.log("load")}
        onSaveToProject={() => console.log("save")}
      />

      <ArpInspectInputs
        isRunning={isRunning}
        onRun={handleRun}
        onReset={reset}
      />

      <ArpInspectDetails entries={entries} />

      {/* TODO: add topology graph visualizing arp  */}
    </div>
  );
}
