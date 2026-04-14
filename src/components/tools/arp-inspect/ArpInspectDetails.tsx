"use client";

import type { ArpEntry } from "@/types/network";

export type { ArpEntry };

export interface ArpInspectDetailsProps {
  entries: ArpEntry[];
}

export const arpRefEntries = [
  {
    address: "ff:ff:ff:ff:ff:ff",
    kind: "mac",
    label: "Broadcast",
    description: "Sent to all hosts on the local segment; used in ARP requests",
    rfc: "RFC 826",
  },
  {
    address: "00:00:00:00:00:00",
    kind: "mac",
    label: "Unspecified",
    description: "Null MAC; used as sender hardware address in ARP probes",
    rfc: "RFC 5227",
  },
  {
    address: "01:00:5e:00:00:00/24",
    kind: "mac",
    label: "IPv4 Multicast Range",
    description: "IANA-reserved OUI block for IPv4 multicast group addresses",
    rfc: "RFC 7042",
  },
  {
    address: "169.254.0.0/16",
    kind: "ip",
    label: "Link-Local (APIPA)",
    description:
      "Self-assigned when DHCP fails; ARP conflicts here trigger re-probe",
    rfc: "RFC 5227",
  },
  {
    address: "0.0.0.0",
    kind: "ip",
    label: "Unspecified Source",
    description:
      "Used as sender IP in ARP probes before address assignment is confirmed",
    rfc: "RFC 5227",
  },
  {
    address: "255.255.255.255",
    kind: "ip",
    label: "Limited Broadcast",
    description:
      "Not routed; ARP is never sent to this address but may appear in malformed frames",
    rfc: null,
  },
];

export function ArpInspectDetails({ entries }: ArpInspectDetailsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* arp table  */}
      <div
        className=" rounded-[3px] gap-4 h-fit"
        style={{
          border: "1px solid var(--ossad-border)",
          backgroundColor: "var(--ossad-bg-surface)",
        }}
      >
        <div className="overflow-x-auto overflow-y-auto max-h-100">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--ossad-border)",
                }}
              >
                {[
                  "IP",
                  "MAC",
                  "VENDOR",
                  "INTERFACE",
                  "ENTRY TYPE",
                  "TTL",
                  "CONFLICT",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left tracking-[0.08em] uppercase font-medium whitespace-nowrap"
                    style={{
                      color: "var(--ossad-text-secondary)",
                      fontSize: "9px",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {entries.length === 0 && (
                <tr style={{ borderBottom: "1px solid var(--ossad-border)" }}>
                  {Array(7)
                    .fill(null)
                    .map((_, i) => (
                      <td
                        key={i}
                        className="px-3 py-2"
                        style={{ color: "var(--ossad-text-secondary)" }}
                      >
                        -
                      </td>
                    ))}
                </tr>
              )}

              {entries.map((entry, idx) => {
                const ipColour = ip2Colour(entry.conflict);
                const macColour = mac2Colour(entry.conflict);
                const conflictColour = conflict2Colour(entry.conflict);
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid var(--ossad-border)",
                    }}
                  >
                    <td
                      className="px-3 py-2"
                      style={{
                        color: ipColour,
                      }}
                    >
                      {entry.ip}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: macColour,
                      }}
                    >
                      {entry.mac}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {entry.vendor ?? "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {entry.interface}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {entry.entryType}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {entry.ttl ?? "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: conflictColour,
                      }}
                    >
                      {entry.conflict ?? "nominal"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* reference table */}
      <div
        className=" rounded-[3px] gap-4 h-fit"
        style={{
          border: "1px solid var(--ossad-border)",
          backgroundColor: "var(--ossad-bg-surface)",
        }}
      >
        <div className="overflow-x-auto overflow-y-auto max-h-100">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--ossad-border)" }}>
                {["address", "label", "description", "rfc"].map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left tracking-[0.08em] uppercase font-medium whitespace-nowrap"
                    style={{
                      color: "var(--ossad-text-secondary)",
                      fontSize: "9px",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {arpRefEntries.map((r, idx) => {
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid var(--ossad-border)",
                    }}
                  >
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {r.address}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {r.label}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {r.description}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {r.rfc}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ip2Colour(conflict: ArpEntry["conflict"]) {
  switch (conflict) {
    case null:
      return "var(--ossad-online)";
    case "duplicate-ip":
      return "var(--ossad-catastrophic)";
    case "static-violation":
      return "var(--ossad-catastrophic)";
    default:
      return "var(--ossad-text-primary)";
  }
}

function mac2Colour(conflict: ArpEntry["conflict"]) {
  switch (conflict) {
    case null:
      return "var(--ossad-online)";
    case "duplicate-mac":
      return "var(--ossad-catastrophic)";
    case "static-violation":
      return "var(--ossad-catastrophic)";
    default:
      return "var(--ossad-text-primary)";
  }
}

function conflict2Colour(conflict: ArpEntry["conflict"]) {
  switch (conflict) {
    case null:
      return "var(--ossad-online)";
    default:
      return "var(--ossad-catastrophic)";
  }
}
