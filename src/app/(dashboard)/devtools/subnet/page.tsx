"use client";

import { useState } from "react";
import ToolHeader from "@/components/ui/ToolHeader";
import { Calculator } from "lucide-react";

function parseIPv4CIDR(cidr: string) {
  const trimmed = cidr.trim();
  if (!/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(trimmed)) return null;

  const [ipPart, prefixStr] = trimmed.split("/");
  const prefix = parseInt(prefixStr);
  if (prefix < 0 || prefix > 32) return null;

  const parts = ipPart.split(".").map(Number);
  if (parts.some((p) => p < 0 || p > 255)) return null;

  const ipInt = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;

  const intToIP = (n: number) =>
    [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

  const intToBinary = (n: number) =>
    [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]
      .map((o) => o.toString(2).padStart(8, "0"))
      .join(".");

  const totalHosts =
    prefix >= 31
      ? Math.pow(2, 32 - prefix)
      : Math.max(0, Math.pow(2, 32 - prefix) - 2);

  const network = intToIP(networkInt);
  const broadcast = intToIP(broadcastInt);
  const firstHost = prefix >= 31 ? network : intToIP(networkInt + 1);
  const lastHost = prefix >= 31 ? broadcast : intToIP(broadcastInt - 1);
  const subnetMask = intToIP(maskInt);
  const wildcardMask = intToIP(~maskInt >>> 0);
  const networkBinary = intToBinary(networkInt);

  const o1 = parts[0], o2 = parts[1];
  let classification = "Public / Globally Routable";
  if (o1 === 10) classification = "Private — RFC 1918 (10.0.0.0/8)";
  else if (o1 === 172 && o2 >= 16 && o2 <= 31) classification = "Private — RFC 1918 (172.16.0.0/12)";
  else if (o1 === 192 && o2 === 168) classification = "Private — RFC 1918 (192.168.0.0/16)";
  else if (o1 === 127) classification = "Loopback (RFC 1122)";
  else if (o1 === 169 && o2 === 254) classification = "Link-local / APIPA (RFC 3927)";
  else if (o1 >= 224 && o1 <= 239) classification = "Multicast (RFC 5771)";
  else if (o1 >= 240) classification = "Reserved / Experimental";
  else if (o1 === 100 && o2 >= 64 && o2 <= 127) classification = "Shared Address Space (RFC 6598)";

  return {
    network, broadcast, firstHost, lastHost,
    totalHosts, subnetMask, wildcardMask,
    networkBinary, prefix, classification,
  };
}

export default function SubnetCalculatorPage() {
  const [input, setInput] = useState("");
  const result = input.includes("/") ? parseIPv4CIDR(input) : null;
  const isInvalid = input.length > 2 && input.includes("/") && !result;

  const rows = result
    ? [
        { label: "Network Address",   value: result.network },
        { label: "Broadcast Address", value: result.broadcast },
        { label: "First Host",        value: result.firstHost },
        { label: "Last Host",         value: result.lastHost },
        { label: "Total Hosts",       value: result.totalHosts.toLocaleString() },
        { label: "Subnet Mask",       value: result.subnetMask },
        { label: "Wildcard Mask",     value: result.wildcardMask },
        { label: "Prefix Length",     value: `/${result.prefix}` },
        { label: "Network (Binary)",  value: result.networkBinary },
        { label: "Classification",    value: result.classification },
      ]
    : [];

  return (
    <div>
      <ToolHeader
        title="Subnet Calculator"
        description="IPv4 subnet math — enter a CIDR to get network, broadcast, host range, mask, and classification."
        icon={Calculator}
      />

      <div className="flex flex-col p-4 mb-5 gap-3 bg-card border border-border">
        <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
          CIDR Notation
        </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 192.168.1.0/24"
          className="px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground placeholder:text-muted-foreground"
        />
        {isInvalid && (
          <span className="text-[11px] text-destructive">
            Invalid CIDR — expected format: 192.168.1.0/24
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
                  Enter a CIDR above to calculate
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.label} className="border-b border-border">
                  <td className="px-3 py-2 text-muted-foreground w-48">{row.label}</td>
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
            { label: "192.168.1.0/24", desc: "Typical home / office LAN" },
            { label: "10.0.0.0/8",    desc: "RFC 1918 — Class A private" },
            { label: "172.16.0.0/12", desc: "RFC 1918 — Class B private" },
            { label: "10.10.10.0/30", desc: "Point-to-point link (2 hosts)" },
            { label: "0.0.0.0/0",     desc: "Default route" },
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

      {/* Reference */}
      <div className="mt-5 border border-border bg-card overflow-hidden">
        <div className="px-3 py-2 border-b border-border">
          <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
            Address Range Reference
          </span>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border">
              {["Range", "Description", "RFC"].map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-medium text-muted-foreground"
                  style={{ fontSize: "10px" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {[
              { range: "10.0.0.0/8",        desc: "Private — Class A",            rfc: "RFC 1918",  group: "private" },
              { range: "172.16.0.0/12",      desc: "Private — Class B",            rfc: "RFC 1918",  group: "private" },
              { range: "192.168.0.0/16",     desc: "Private — Class C",            rfc: "RFC 1918",  group: "private" },
              { range: "127.0.0.0/8",        desc: "Loopback",                     rfc: "RFC 1122",  group: "special" },
              { range: "169.254.0.0/16",     desc: "Link-local / APIPA",           rfc: "RFC 3927",  group: "special" },
              { range: "100.64.0.0/10",      desc: "Shared address space (CGNAT)", rfc: "RFC 6598",  group: "special" },
              { range: "192.0.2.0/24",       desc: "Documentation (TEST-NET-1)",   rfc: "RFC 5737",  group: "doc" },
              { range: "198.51.100.0/24",    desc: "Documentation (TEST-NET-2)",   rfc: "RFC 5737",  group: "doc" },
              { range: "203.0.113.0/24",     desc: "Documentation (TEST-NET-3)",   rfc: "RFC 5737",  group: "doc" },
              { range: "224.0.0.0/4",        desc: "Multicast",                    rfc: "RFC 5771",  group: "special" },
              { range: "240.0.0.0/4",        desc: "Reserved / Experimental",      rfc: "RFC 1112",  group: "special" },
              { range: "255.255.255.255/32", desc: "Limited broadcast",            rfc: "RFC 919",   group: "special" },
            ].map((row) => (
              <tr key={row.range} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2 text-foreground w-44">{row.range}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.desc}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{row.rfc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
