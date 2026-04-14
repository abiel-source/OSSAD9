"use client";

import { Hop } from "./types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface TraceDetailsProps {
  hops: Hop[];
}

export default function TraceDetails({ hops }: TraceDetailsProps) {
  const chartData = hops.map((hop) => ({
    ttl: hop.ttl,
    rtt: avgRTT(hop), // null for timeouts — recharts skips nulls = gap
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Left: sparkline */}
      <div
        className="lg:w-[40%] rounded-[3px] p-4"
        style={{
          border: "1px solid var(--ossad-border)",
          backgroundColor: "var(--ossad-bg-surface)",
        }}
      >
        <span
          className="text-[10px] font-mono tracking-[0.1em] uppercase block mb-4"
          style={{ color: "var(--ossad-text-secondary)" }}
        >
          RTT per Hop (ms)
        </span>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--ossad-border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="ttl"
              tick={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                fill: "var(--ossad-text-secondary)",
              }}
              label={{
                value: "TTL",
                position: "insideBottomRight",
                offset: -4,
                fontSize: 9,
                fill: "var(--ossad-text-secondary)",
                fontFamily: "var(--font-mono)",
              }}
            />
            <YAxis
              tick={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                fill: "var(--ossad-text-secondary)",
              }}
              width={36}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--ossad-bg-elevated)",
                border: "1px solid var(--ossad-border)",
                borderRadius: "3px",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--ossad-text-primary)",
              }}
              formatter={(value) => [`${Number(value)}ms`, "RTT"]}
              labelFormatter={(label) => `TTL ${label}`}
            />
            <Line
              type="monotone"
              dataKey="rtt"
              stroke="var(--ossad-accent)"
              strokeWidth={1.5}
              dot={{ r: 3, fill: "var(--ossad-accent)", strokeWidth: 0 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Right: hop table */}
      <div
        className="lg:w-[60%] rounded-[3px] overflow-hidden"
        style={{
          border: "1px solid var(--ossad-border)",
          backgroundColor: "var(--ossad-bg-surface)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--ossad-border)" }}>
                {[
                  "TTL",
                  "IP",
                  "Hostname",
                  "ASN",
                  "RTT 1",
                  "RTT 2",
                  "RTT 3",
                  "Loss",
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
              {hops.length === 0 && (
                <tr
                  style={{
                    borderBottom: "1px solid var(--ossad-border)",
                  }}
                >
                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--ossad-text-secondary)" }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--ossad-text-secondary)" }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--ossad-text-secondary)" }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--ossad-text-secondary)" }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--ossad-text-secondary)" }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--ossad-text-secondary)" }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--ossad-text-secondary)" }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--ossad-text-secondary)" }}
                  >
                    -
                  </td>
                </tr>
              )}
              {hops.map((hop) => {
                const isTimeout = hop.ip === null;
                const loss = calcLoss(hop);
                return (
                  <tr
                    key={hop.ttl}
                    style={{
                      borderBottom: "1px solid var(--ossad-border)",
                      opacity: isTimeout ? 0.45 : 1,
                    }}
                  >
                    <td
                      className="px-3 py-2"
                      style={{ color: "var(--ossad-text-secondary)" }}
                    >
                      {hop.ttl}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{ color: "var(--ossad-text-primary)" }}
                    >
                      {hop.ip ?? "—"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{ color: "var(--ossad-text-secondary)" }}
                    >
                      {hop.hostname ?? "—"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{ color: "var(--ossad-text-secondary)" }}
                    >
                      {hop.asn ?? "—"}
                    </td>
                    {hop.rtts.map((rtt, i) => (
                      <td
                        key={i}
                        className="px-3 py-2"
                        style={{ color: rttColor(rtt) }}
                      >
                        {rtt !== null ? `${rtt}ms` : "—"}
                      </td>
                    ))}
                    <td
                      className="px-3 py-2"
                      style={{
                        color:
                          loss > 0
                            ? "var(--ossad-catastrophic)"
                            : "var(--ossad-online)",
                      }}
                    >
                      {loss}%
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

// Helpers
function avgRTT(hop: Hop): number | null {
  const valid = hop.rtts.filter((r) => r !== null) as number[];
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

function calcLoss(hop: Hop): number {
  const timeouts = hop.rtts.filter((r) => r === null).length;
  return Math.round((timeouts / hop.rtts.length) * 100);
}

function rttColor(rtt: number | null): string {
  if (rtt === null) return "var(--ossad-text-secondary)";
  if (rtt < 50) return "var(--ossad-online)";
  if (rtt < 150) return "var(--ossad-cautious)";
  return "var(--ossad-catastrophic)";
}
