"use client";

import { Hop } from "@/types/network";
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
      <div className="lg:w-[40%] p-4 border border-border bg-card">
        <span className="text-[11px] tracking-[0.1em] uppercase block mb-4 text-muted-foreground">
          RTT per Hop (ms)
        </span>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="ttl"
              tick={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fill: "var(--muted-foreground)",
              }}
              label={{
                value: "TTL",
                position: "insideBottomRight",
                offset: -4,
                fontSize: 11,
                fill: "var(--muted-foreground)",
                fontFamily: "var(--font-mono)",
              }}
            />
            <YAxis
              tick={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fill: "var(--muted-foreground)",
              }}
              width={36}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                color: "var(--foreground)",
              }}
              formatter={(value) => [`${Number(value)}ms`, "RTT"]}
              labelFormatter={(label) => `TTL ${label}`}
            />
            <Line
              type="monotone"
              dataKey="rtt"
              stroke="var(--primary)"
              strokeWidth={1.5}
              dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Right: hop table */}
      <div className="lg:w-[60%] overflow-hidden border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
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
                    className="px-3 py-2 text-left tracking-[0.08em] uppercase font-medium whitespace-nowrap text-muted-foreground"
                    style={{ fontSize: "10px" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono">
              {hops.length === 0 && (
                <tr className="border-b border-border">
                  {Array(8).fill(null).map((_, i) => (
                    <td key={i} className="px-3 py-2 text-muted-foreground">-</td>
                  ))}
                </tr>
              )}
              {hops.map((hop) => {
                const isTimeout = hop.ip === null;
                const loss = calcLoss(hop);
                return (
                  <tr
                    key={hop.ttl}
                    className="border-b border-border"
                    style={{ opacity: isTimeout ? 0.45 : 1 }}
                  >
                    <td className="px-3 py-2 text-muted-foreground">{hop.ttl}</td>
                    <td className="px-3 py-2 text-foreground">{hop.ip ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{hop.hostname ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{hop.asn ?? "—"}</td>
                    {hop.rtts.map((rtt, i) => (
                      <td key={i} className="px-3 py-2" style={{ color: rttColor(rtt) }}>
                        {rtt !== null ? `${rtt}ms` : "—"}
                      </td>
                    ))}
                    <td
                      className="px-3 py-2"
                      style={{
                        color: loss > 0 ? "var(--destructive)" : "var(--color-emerald-500)",
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
  if (rtt === null) return "var(--muted-foreground)";
  if (rtt < 50) return "var(--color-emerald-500)";
  if (rtt < 150) return "var(--color-amber-500)";
  return "var(--destructive)";
}
