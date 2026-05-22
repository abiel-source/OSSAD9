"use client";

import { useMemo, useState } from "react";

import { useTopologyStore } from "@/store/topology";
import { useRouteTraceStore } from "@/store/routetrace";
import { useArpStore } from "@/store/arp";
import { Hop, DiscoveredHost, ArpEntry, InventoryItem } from "@/types/network";

import ToolHeader from "@/components/tools/ToolHeader";
import { Database } from "lucide-react";
import { DeviceInventoryTable } from "@/components/tools/inventory/DeviceInventoryTable";
import { InventoryInputs } from "@/components/tools/inventory/InventoryInputs";

import { InventoryStats } from "@/components/tools/inventory/InventoryStats";

const COMPLIANCES = ["WCAG AA"];

function Hops2Items(hops: Hop[]): InventoryItem[] {
  return hops
    .filter((hop): hop is Hop & { ip: string } => hop.ip !== null)
    .map((hop) => {
      return {
        ip: hop.ip,
        hostname: hop.hostname,
        asn: hop.asn,
        rtts: hop.rtts,
        mac: null,
        vendor: null,
        deviceType: null,
        latencyMs: null,
        entryType: null,
        conflict: null,
        sources: ["routetrace"],
      };
    });
}

function Host2Item(host: DiscoveredHost): InventoryItem {
  return {
    ip: host.ip,
    hostname: host.hostname,
    mac: host.mac,
    vendor: host.vendor,
    deviceType: host.deviceType,
    latencyMs: host.latencyMs,
    asn: null,
    rtts: null,
    entryType: null,
    conflict: null,
    sources: ["hostmap"],
  };
}

function Entry2Item(entry: ArpEntry): InventoryItem {
  return {
    ip: entry.ip,
    hostname: null,
    mac: entry.mac,
    vendor: entry.vendor,
    deviceType: null,
    latencyMs: null,
    asn: null,
    rtts: null,
    entryType: entry.entryType,
    conflict: entry.conflict,
    sources: ["arp"],
  };
}

// EDGE CASE: theoretically possible that items 1 and 2 may have field collisions. They may refer to the same network device but have a field with conflicting (non-null) values.
// TEMPORARY SOLUTION: i1 is "privileged" - has its fields considered first and i2 is the fallback
function merge(i1: InventoryItem, i2: InventoryItem): InventoryItem {
  if (i1.ip !== i2.ip) throw new Error("merge: IP mismatch");

  return {
    ip: i1.ip,
    hostname: i1.hostname ?? i2.hostname,
    mac: i1.mac ?? i2.mac,
    vendor: i1.vendor ?? i2.vendor,
    deviceType: i1.deviceType ?? i2.deviceType,
    latencyMs: i1.latencyMs ?? i2.latencyMs,
    asn: i1.asn ?? i2.asn,
    rtts: i1.rtts ?? i2.rtts,
    entryType: i1.entryType ?? i2.entryType,
    conflict: i1.conflict ?? i2.conflict,
    sources: [...new Set([...i1.sources, ...i2.sources])],
  };
}

export default function DeviceInventoryPage() {
  const { hosts } = useTopologyStore();
  const { hops } = useRouteTraceStore();
  const { entries } = useArpStore();

  const catalogue = useMemo(() => {
    // 1. UNIFY TYPES:
    // unify first before merge otherwise we need to consider granular per-type merging
    const itemizedHosts = Object.values(hosts).map((host) => Host2Item(host));
    const itemizedHops = Hops2Items(hops);
    const itemizedEntries = entries.map((entry) => Entry2Item(entry));

    // 2. MERGE LOGIC:
    // any address conflicts are lifted from only ARP
    // all other address conflicts are treated as cross-tool duplicates and will be discarded
    // key idea is to check for duplicate(s) and merge duplicates as we go (single pass)
    //
    // keep arp entries as they are- persist all ip/mac conflicts
    // then merge itemizedHosts and itemizedHops into arp entries which includes arp-tool duplicates

    const mergedItems = new Map<string, InventoryItem[]>(); // keyed by IP

    // initialize map with arp entries
    itemizedEntries.forEach((entry) => {
      const conflicts = mergedItems.get(entry.ip);

      if (conflicts !== undefined) {
        mergedItems.set(entry.ip, [...conflicts, entry]);
      } else {
        mergedItems.set(entry.ip, [entry]);
      }
    });

    // merge discovered hosts
    itemizedHosts.forEach((host) => {
      const duplicates = mergedItems.get(host.ip);

      if (duplicates !== undefined) {
        mergedItems.set(
          host.ip,
          duplicates.map((dup) => merge(dup, host)) // arp entry is privileged
        );
      } else {
        mergedItems.set(host.ip, [host]);
      }
    });

    // merge hops
    itemizedHops.forEach((hop) => {
      const duplicates = mergedItems.get(hop.ip);

      if (duplicates !== undefined) {
        mergedItems.set(
          hop.ip,
          duplicates.map((dup) => merge(dup, hop)) // arp entry has privilege over hop
        );
      } else {
        mergedItems.set(hop.ip, [hop]);
      }
    });

    // 3. FLATTEN DUPLICATES:
    return Array.from(mergedItems.values()).flat();
  }, [hosts, hops, entries]);

  const [filtered, setFiltered] = useState<InventoryItem[]>([]);

  return (
    <div>
      <ToolHeader
        title="Network Inventory"
        description="Discovered host table with IP, MAC, vendor, OS, and hostname metadata."
        icon={Database}
        rfcBadges={COMPLIANCES}
        onExportJSON={() => console.log("export json")}
        onExportCSV={() => console.log("export csv")}
        onLoadFromProject={() => console.log("load")}
        onSaveToProject={() => console.log("save")}
      />

      {/* <DeviceInventoryTable catalogue={catalogue} /> */}

      <InventoryInputs catalogue={catalogue} onFilter={setFiltered} />

      <InventoryStats filtered={filtered} />

      <DeviceInventoryTable catalogue={filtered} />
    </div>
  );
}
