"use client";

import { useState } from "react";
import ToolHeader from "@/components/ui/ToolHeader";
import { Tag } from "lucide-react";

// Common OUI prefixes — top vendors
const OUI_TABLE: Record<string, string> = {
  "000C29": "VMware", "005056": "VMware", "000569": "VMware",
  "080027": "Oracle VirtualBox", "525400": "QEMU / KVM",
  "001B63": "Apple Inc.", "001CB3": "Apple Inc.", "001D4F": "Apple Inc.",
  "001E52": "Apple Inc.", "001F5B": "Apple Inc.", "0021E9": "Apple Inc.",
  "002312": "Apple Inc.", "002500": "Apple Inc.", "0025BC": "Apple Inc.",
  "0026BB": "Apple Inc.", "3C0754": "Apple Inc.", "A8866A": "Apple Inc.",
  "F01898": "Apple Inc.", "7056817": "Apple Inc.",
  "00000C": "Cisco Systems", "001A1E": "Cisco Systems", "001A2B": "Cisco Systems",
  "001B54": "Cisco Systems", "FCFBFB": "Cisco Systems", "001711": "Cisco Systems",
  "001526": "Dell Inc.", "001A4B": "Hewlett Packard", "001CC4": "Hewlett Packard",
  "001E0B": "Hewlett Packard", "B8AC6F": "Dell Inc.", "141877": "Dell Inc.",
  "24B6FD": "Dell Inc.", "D4BED9": "Dell Inc.", "001517": "Intel Corporate",
  "0019D1": "Intel Corporate", "001B21": "Intel Corporate", "00216A": "Intel Corporate",
  "0024D7": "Intel Corporate", "1CC1DE": "Intel Corporate",
  "000300": "Microsoft", "00155D": "Microsoft", "281878": "Microsoft",
  "001A2C": "Ubiquiti Networks", "0418D6": "Ubiquiti Networks", "DC9FDB": "Ubiquiti Networks",
  "18E829": "TP-Link Technologies", "EC086B": "TP-Link Technologies",
  "080020": "Sun Microsystems", "00163E": "Xen Source", "00005E": "IANA",
  "D89EF3": "Samsung Electronics", "8C771F": "Samsung Electronics",
  "001869": "Netgear", "00A040": "Netgear",
};

function normalizeMac(raw: string): string | null {
  const clean = raw.replace(/[:\-.\s]/g, "").toUpperCase();
  if (!/^[0-9A-F]{12}$/.test(clean)) return null;
  return clean;
}

function formatMac(clean: string, style: "colon" | "dash" | "cisco" | "bare"): string {
  const pairs = clean.match(/.{2}/g)!;
  if (style === "colon")  return pairs.join(":");
  if (style === "dash")   return pairs.join("-");
  if (style === "cisco")  return [pairs.slice(0,2).join(""), pairs.slice(2,4).join(""), pairs.slice(4,6).join("")].join(".");
  return clean;
}

function lookupOUI(clean: string): string {
  const key = clean.slice(0, 6).toUpperCase();
  return OUI_TABLE[key] ?? "Unknown vendor";
}

function macToEUI64(clean: string): string {
  const bytes = clean.match(/.{2}/g)!;
  const flipped = (parseInt(bytes[0], 16) ^ 0x02).toString(16).padStart(2, "0").toUpperCase();
  return `${flipped}${bytes[1]}:${bytes[2]}FF:FE${bytes[3]}:${bytes[4]}${bytes[5]}`;
}

function classifyMac(clean: string): { type: string; scope: string } {
  if (clean === "FFFFFFFFFFFF") return { type: "Broadcast", scope: "UAA (Universally Administered)" };
  const first = parseInt(clean.slice(0, 2), 16);
  const type  = (first & 0x01) === 0 ? "Unicast" : "Multicast";
  const scope = (first & 0x02) === 0 ? "UAA (Universally Administered)" : "LAA (Locally Administered)";
  return { type, scope };
}

export default function MacToolsPage() {
  const [input, setInput] = useState("");
  const clean = normalizeMac(input);
  const isInvalid = input.length > 5 && !clean;
  const cls = clean ? classifyMac(clean) : null;

  const rows = clean
    ? [
        { label: "Colon-separated (IEEE)",    value: formatMac(clean, "colon") },
        { label: "Dash-separated (Windows)",  value: formatMac(clean, "dash") },
        { label: "Cisco dotted",              value: formatMac(clean, "cisco") },
        { label: "Bare (no delimiter)",        value: formatMac(clean, "bare") },
        { label: "OUI Vendor",                value: lookupOUI(clean) },
        { label: "EUI-64",                    value: macToEUI64(clean) },
        { label: "Address type",              value: cls?.type ?? "" },
        { label: "Address scope",             value: cls?.scope ?? "" },
      ]
    : [];

  return (
    <div>
      <ToolHeader
        title="MAC & OUI Tools"
        description="MAC address formatting, OUI vendor lookup, EUI-64 generation, and address classification."
        icon={Tag}
      />

      <div className="flex flex-col p-4 mb-5 gap-3 bg-card border border-border">
        <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
          MAC Address
        </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 00:1A:2B:3C:4D:5E — colon, dash, Cisco, or bare"
          className="px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground placeholder:text-muted-foreground"
        />
        {isInvalid && (
          <span className="text-[11px] text-destructive">
            Invalid MAC address — expected 12 hex digits in any common delimiter format
          </span>
        )}
      </div>

      <div className="border border-border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border">
              {["Field", "Value"].map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left tracking-[0.08em] uppercase font-medium text-muted-foreground"
                  style={{ fontSize: "10px" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-3 py-10 text-center text-[12px] text-muted-foreground">
                  Enter a MAC address above
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.label} className="border-b border-border">
                  <td className="px-3 py-2 text-muted-foreground w-52">{row.label}</td>
                  <td className="px-3 py-2 text-foreground">{row.value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Examples */}
      <div className="mt-5 flex flex-col p-4 gap-3 bg-card border border-border">
        <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">Examples</span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "00:0C:29:4A:B2:C1", desc: "VMware (colon)" },
            { label: "00-1B-63-AA-BB-CC", desc: "Apple Inc. (dash)" },
            { label: "0000.0C12.3456",    desc: "Cisco (dotted)" },
            { label: "001A2BFCFBFA",      desc: "Cisco Systems (bare)" },
            { label: "FF:FF:FF:FF:FF:FF", desc: "Broadcast" },
            { label: "02:00:5E:10:00:01", desc: "LAA unicast" },
          ].map((ex) => (
            <button
              key={ex.label}
              onClick={() => setInput(ex.label)}
              className="px-3 py-1.5 text-left text-[12px] font-mono border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span className="text-foreground">{ex.label}</span>
              <span className="ml-2 text-[11px] hidden sm:inline">— {ex.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
