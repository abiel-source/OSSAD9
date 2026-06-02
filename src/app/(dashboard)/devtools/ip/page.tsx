"use client";

import { useState } from "react";
import ToolHeader from "@/components/ui/ToolHeader";
import { Code2 } from "lucide-react";

function parseIP(ip: string): number[] | null {
  const parts = ip.trim().split(".").map(Number);
  if (parts.length !== 4) return null;
  if (parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
  return parts;
}

function ipToInt(parts: number[]): number {
  return (
    ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  );
}

function classifyIP(parts: number[]): string {
  const [o1, o2] = parts;
  if (o1 === 127) return "Loopback (RFC 1122)";
  if (o1 === 10) return "Private — RFC 1918 (10.0.0.0/8)";
  if (o1 === 172 && o2 >= 16 && o2 <= 31) return "Private — RFC 1918 (172.16.0.0/12)";
  if (o1 === 192 && o2 === 168) return "Private — RFC 1918 (192.168.0.0/16)";
  if (o1 === 169 && o2 === 254) return "Link-local / APIPA (RFC 3927)";
  if (o1 >= 224 && o1 <= 239) return "Multicast (RFC 5771)";
  if (o1 >= 240) return "Reserved / Experimental";
  if (o1 === 0) return "Unspecified / This network";
  if (o1 === 100 && o2 >= 64 && o2 <= 127) return "Shared Address Space (RFC 6598)";
  return "Public / Globally Routable";
}

export default function IpUtilitiesPage() {
  const [input, setInput] = useState("");
  const parts = parseIP(input);
  const isInvalid = input.length > 6 && !parts;

  const results = parts
    ? [
        { label: "Decimal (dotted)",  value: input.trim() },
        { label: "Binary",            value: parts.map((o) => o.toString(2).padStart(8, "0")).join(".") },
        { label: "Hexadecimal",       value: "0x" + parts.map((o) => o.toString(16).padStart(2, "0")).join("").toUpperCase() },
        { label: "Octal",             value: parts.map((o) => "0" + o.toString(8)).join(".") },
        { label: "32-bit Integer",    value: ipToInt(parts).toString() },
        { label: "Reverse DNS (PTR)", value: [...parts].reverse().join(".") + ".in-addr.arpa" },
        { label: "Classification",    value: classifyIP(parts) },
      ]
    : [];

  return (
    <div>
      <ToolHeader
        title="IP Utilities"
        description="IPv4 format conversion, classification, reverse DNS PTR, and address analysis."
        icon={Code2}
      />

      <div className="flex flex-col p-4 mb-5 gap-3 bg-card border border-border">
        <span className="text-[11px] uppercase text-muted-foreground">
          IPv4 Address
        </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 192.168.1.1"
          className="px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground placeholder:text-muted-foreground"
        />
        {isInvalid && (
          <span className="text-[11px] text-destructive">
            Invalid IPv4 address — expected format: 192.168.1.1
          </span>
        )}
      </div>

      <div className="border border-border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border">
              {["Representation", "Value"].map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left uppercase font-medium text-muted-foreground"
                  style={{ fontSize: "10px" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {results.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-3 py-10 text-center text-[12px] text-muted-foreground">
                  Enter an IPv4 address above
                </td>
              </tr>
            ) : (
              results.map((row) => (
                <tr key={row.label} className="border-b border-border">
                  <td className="px-3 py-2 text-muted-foreground w-48">{row.label}</td>
                  <td className="px-3 py-2 text-foreground break-all">{row.value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Examples */}
      <div className="mt-5 flex flex-col p-4 gap-3 bg-card border border-border">
        <span className="text-[11px] uppercase text-muted-foreground">Examples</span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "127.0.0.1",    desc: "Loopback" },
            { label: "192.168.1.1",  desc: "Private — default gateway" },
            { label: "10.0.0.1",     desc: "Private — RFC 1918" },
            { label: "8.8.8.8",      desc: "Public — Google DNS" },
            { label: "169.254.1.1",  desc: "Link-local / APIPA" },
            { label: "224.0.0.1",    desc: "Multicast — all hosts" },
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
