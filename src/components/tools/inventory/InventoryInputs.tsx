"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { InventoryItem } from "@/types/network";

type SourceKey = "hostmap" | "routetrace" | "arp";
type SortField = "ip" | "hostname" | "vendor" | "latencyMs" | "asn";
type SortDir = "asc" | "desc";
type EntryType = "any" | "static" | "dynamic" | "unknown";

interface InventoryInputsProps {
  catalogue: InventoryItem[];
  onFilter: (filtered: InventoryItem[]) => void;
}

const COMPLIANCES = [
  "RFC 792",
  "RFC 1393",
  "RFC 2544",
  "RFC 4443",
  "RFC 826",
  "RFC 5227",
  "RFC 7042",
  "RFC 1122",
  "WCAG AA",
  "SOC 2",
];

export function InventoryInputs({ catalogue, onFilter }: InventoryInputsProps) {
  const [search, setSearch] = useState("");
  const [sources, setSources] = useState<Record<SourceKey, boolean>>({
    hostmap: true,
    routetrace: true,
    arp: true,
  });
  const [conflictsOnly, setConflictsOnly] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState<Record<string, boolean>>({
    router: true,
    device: true,
    unknown: true,
  });
  const [sortField, setSortField] = useState<SortField>("ip");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [entryType, setEntryType] = useState<EntryType>("any");
  const [minLatency, setMinLatency] = useState<number | null>(null);
  const [minRtt, setMinRtt] = useState<number | null>(null);

  useEffect(() => {
    let result = [...catalogue];

    // text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.ip.toLowerCase().includes(q) ||
          (item.hostname?.toLowerCase().includes(q) ?? false) ||
          (item.mac?.toLowerCase().includes(q) ?? false) ||
          (item.vendor?.toLowerCase().includes(q) ?? false) ||
          (item.asn?.toLowerCase().includes(q) ?? false)
      );
    }

    // source filter
    result = result.filter((item) => item.sources.some((s) => sources[s]));

    // conflicts only
    if (conflictsOnly) {
      result = result.filter((item) => item.conflict !== null);
    }

    // device type filter
    result = result.filter((item) => {
      const type = item.deviceType ?? "unknown";
      return deviceTypes[type];
    });

    // entry type filter
    result = result.filter((item) => {
      if (entryType === "unknown") return item.entryType === null;
      if (entryType === "any") return item;
      return item.entryType === entryType;
    });

    // latency threshold
    if (minLatency !== null) {
      result = result.filter(
        (item) => item.latencyMs !== null && item.latencyMs >= minLatency
      );
    }

    // rtt threshold
    if (minRtt !== null) {
      result = result.filter((item) => {
        if (!item.rtts) return false;
        const valid = item.rtts.filter((r): r is number => r !== null);
        if (valid.length === 0) return false;
        const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
        return avg >= minRtt;
      });
    }

    // sort
    result.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      if (sortField === "ip") {
        const numA = a.ip
          .split(".")
          .reduce((acc, oct) => acc * 256 + parseInt(oct, 10), 0);
        const numB = b.ip
          .split(".")
          .reduce((acc, oct) => acc * 256 + parseInt(oct, 10), 0);
        return (numA - numB) * dir;
      }

      if (sortField === "latencyMs") {
        return ((a.latencyMs ?? 0) - (b.latencyMs ?? 0)) * dir;
      }

      // string fields
      const valA = (a[sortField] ?? "") as string;
      const valB = (b[sortField] ?? "") as string;
      return valA.localeCompare(valB) * dir;
    });

    onFilter(result);
  }, [
    catalogue,
    search,
    sources,
    conflictsOnly,
    deviceTypes,
    sortField,
    sortDir,
    entryType,
    minLatency,
    minRtt,
    onFilter,
  ]);

  const toggleSource = (key: SourceKey) => {
    setSources((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDeviceType = (key: string) => {
    setDeviceTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearFilters = () => {
    setSearch("");
    setSources({ hostmap: true, routetrace: true, arp: true });
    setConflictsOnly(false);
    setDeviceTypes({ router: true, device: true, unknown: true });
    setSortField("ip");
    setSortDir("asc");
    setEntryType("any");
    setMinLatency(null);
    setMinRtt(null);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    !sources.hostmap ||
    !sources.routetrace ||
    !sources.arp ||
    conflictsOnly ||
    !deviceTypes.router ||
    !deviceTypes.device ||
    !deviceTypes.unknown ||
    sortField !== "ip" ||
    entryType !== "any" ||
    minLatency !== null ||
    minRtt !== null ||
    sortDir !== "asc";

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-[3px] mb-6"
      style={{
        border: "1px solid var(--ossad-border)",
        backgroundColor: "var(--ossad-bg-surface)",
      }}
    >
      {/* Header */}
      <div className="flex items-center flex-shrink-0">
        <span
          className="text-[10px] font-mono tracking-[0.16em] uppercase"
          style={{ color: "var(--ossad-text-secondary)" }}
        >
          INVENTORY CONFIGURATION
        </span>
      </div>

      {/* Badge Line */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {COMPLIANCES.map((badge) => (
          <div
            key={badge}
            className="px-2 py-[3px] rounded-[3px] text-[7.5px] font-mono tracking-[0.15em] uppercase"
            style={{
              border: "1px solid rgba(54,123,240,0.25)",
              backgroundColor: "rgba(54,123,240,0.05)",
              color: "var(--ossad-accent)",
            }}
          >
            {badge}
          </div>
        ))}

        <span
          className="text-[9px] font-mono tracking-[0.08em]"
          style={{ color: "var(--ossad-text-secondary)" }}
        >
          compliant when required
        </span>
      </div>

      {/* Row 1: search + clear + result count */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-[3px]"
          style={{
            border: "1px solid var(--ossad-border)",
            backgroundColor: "var(--ossad-bg-elevated)",
          }}
        >
          <Search size={12} style={{ color: "var(--ossad-text-secondary)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search IP, hostname, MAC, vendor, ASN..."
            className="flex-1 bg-transparent text-[12px] font-mono outline-none"
            style={{ color: "var(--ossad-text-primary)" }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={12} style={{ color: "var(--ossad-text-secondary)" }} />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded-[3px] text-[11px] font-mono tracking-[0.08em] transition-colors duration-150 flex-shrink-0"
            style={{
              border: "1px solid rgba(239,68,68,0.3)",
              backgroundColor: "rgba(239,68,68,0.1)",
              color: "var(--ossad-catastrophic)",
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Row 2: source toggles + conflict toggle + Sort by + device type toggles */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Source toggles */}
        <div className="flex items-center gap-1">
          <span
            className="text-[10px] font-mono tracking-[0.08em] mr-1"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            SOURCE
          </span>
          {(["hostmap", "routetrace", "arp"] as SourceKey[]).map((key) => (
            <button
              key={key}
              onClick={() => toggleSource(key)}
              className="px-2 py-1 rounded-[3px] text-[10px] font-mono tracking-[0.08em] transition-colors duration-150"
              style={{
                backgroundColor: sources[key]
                  ? "rgba(54,123,240,0.12)"
                  : "var(--ossad-bg-elevated)",
                border: sources[key]
                  ? "1px solid rgba(54,123,240,0.3)"
                  : "1px solid var(--ossad-border)",
                color: sources[key]
                  ? "var(--ossad-accent)"
                  : "var(--ossad-text-secondary)",
              }}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div
          className="w-px h-4"
          style={{ backgroundColor: "var(--ossad-border)" }}
        />

        {/* Device type toggles */}
        <div className="flex items-center gap-1">
          <span
            className="text-[10px] font-mono tracking-[0.08em] mr-1"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            TYPE
          </span>
          {["router", "device", "unknown"].map((key) => (
            <button
              key={key}
              onClick={() => toggleDeviceType(key)}
              className="px-2 py-1 rounded-[3px] text-[10px] font-mono tracking-[0.08em] transition-colors duration-150"
              style={{
                backgroundColor: deviceTypes[key]
                  ? "rgba(54,123,240,0.12)"
                  : "var(--ossad-bg-elevated)",
                border: deviceTypes[key]
                  ? "1px solid rgba(54,123,240,0.3)"
                  : "1px solid var(--ossad-border)",
                color: deviceTypes[key]
                  ? "var(--ossad-accent)"
                  : "var(--ossad-text-secondary)",
              }}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div
          className="w-px h-4"
          style={{ backgroundColor: "var(--ossad-border)" }}
        />

        {/* Conflicts only */}
        <button
          onClick={() => setConflictsOnly(!conflictsOnly)}
          className="px-2 py-1 rounded-[3px] text-[10px] font-mono tracking-[0.08em] transition-colors duration-150"
          style={{
            backgroundColor: conflictsOnly
              ? "rgba(239,68,68,0.1)"
              : "var(--ossad-bg-elevated)",
            border: conflictsOnly
              ? "1px solid rgba(239,68,68,0.3)"
              : "1px solid var(--ossad-border)",
            color: conflictsOnly
              ? "var(--ossad-catastrophic)"
              : "var(--ossad-text-secondary)",
          }}
        >
          conflicts only
        </button>
      </div>

      {/* Row 3: Sort By + Entry Type  */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Entry Type */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-mono tracking-[0.08em]"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            ENTRY TYPE
          </span>
          <select
            value={entryType}
            onChange={(e) => setEntryType(e.target.value as EntryType)}
            className="px-2 py-1 rounded-[3px] text-[10px] font-mono outline-none"
            style={{
              backgroundColor: "var(--ossad-bg-elevated)",
              border: "1px solid var(--ossad-border)",
              color: "var(--ossad-text-primary)",
            }}
          >
            <option value="any">Any</option>
            <option value="static">Static</option>
            <option value="dynamic">Dynamic</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Divider */}
        <div
          className="w-px h-4"
          style={{ backgroundColor: "var(--ossad-border)" }}
        />

        {/* Latency threshold */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-mono tracking-[0.08em]"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            MIN LATENCY
          </span>
          <input
            type="number"
            min={0}
            placeholder="ms"
            value={minLatency ?? ""}
            onChange={(e) =>
              setMinLatency(e.target.value === "" ? null : Number(e.target.value))
            }
            className="w-16 px-2 py-1 rounded-[3px] text-[10px] font-mono text-center outline-none"
            style={{
              backgroundColor: "var(--ossad-bg-elevated)",
              border: "1px solid var(--ossad-border)",
              color: "var(--ossad-text-primary)",
            }}
          />
        </div>

        {/* Divider */}
        <div
          className="w-px h-4"
          style={{ backgroundColor: "var(--ossad-border)" }}
        />

        {/* RTT threshold */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-mono tracking-[0.08em]"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            MIN RTT
          </span>
          <input
            type="number"
            min={0}
            placeholder="ms"
            value={minRtt ?? ""}
            onChange={(e) =>
              setMinRtt(e.target.value === "" ? null : Number(e.target.value))
            }
            className="w-16 px-2 py-1 rounded-[3px] text-[10px] font-mono text-center outline-none"
            style={{
              backgroundColor: "var(--ossad-bg-elevated)",
              border: "1px solid var(--ossad-border)",
              color: "var(--ossad-text-primary)",
            }}
          />
        </div>

        {/* Divider */}
        <div
          className="w-px h-4"
          style={{ backgroundColor: "var(--ossad-border)" }}
        />

        {/* Sort by */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-mono tracking-[0.08em]"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            SORT BY
          </span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-2 py-1 rounded-[3px] text-[10px] font-mono outline-none"
            style={{
              backgroundColor: "var(--ossad-bg-elevated)",
              border: "1px solid var(--ossad-border)",
              color: "var(--ossad-text-primary)",
            }}
          >
            <option value="ip">IP</option>
            <option value="hostname">Hostname</option>
            <option value="vendor">Vendor</option>
            <option value="latencyMs">Latency</option>
            <option value="asn">ASN</option>
          </select>
          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="px-2 py-1 rounded-[3px] text-[10px] font-mono tracking-[0.08em] transition-colors duration-150"
            style={{
              backgroundColor: "var(--ossad-bg-elevated)",
              border: "1px solid var(--ossad-border)",
              color: "var(--ossad-text-secondary)",
            }}
          >
            {sortDir === "asc" ? "ASC" : "DESC"}
          </button>
        </div>
      </div>

      {/* Row 4: result count */}
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <span
          className="text-[10px] font-mono tracking-[0.08em]"
          style={{ color: "var(--ossad-text-secondary)", opacity: 0.66 }}
        >
          showing {catalogue.length} records
        </span>
      </div>
    </div>
  );
}
