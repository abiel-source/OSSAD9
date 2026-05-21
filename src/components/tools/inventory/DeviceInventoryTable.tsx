"use client";

import { InventoryItem } from "@/types/network";

export interface DeviceInventoryProps {
  catalogue: InventoryItem[];
}

function avgRTT(item: InventoryItem): string | null {
  if (!item.rtts) return null;

  const valid = item.rtts.filter((r) => r !== null) as number[];
  if (valid.length === 0) return null;

  const avgRTT = valid.reduce((a, b) => a + b, 0) / valid.length;
  return avgRTT.toFixed(2);
}

export function DeviceInventoryTable({ catalogue }: DeviceInventoryProps) {
  return (
    <div>
      <div className="gap-5 h-fit border border-border bg-card">
        <div className="overflow-x-auto overflow-y-auto max-h-100">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                {[
                  "ip",
                  "hostname",
                  "mac",
                  "vendor",
                  "device Type",
                  "latencyMs",
                  "asn",
                  "avg rtts",
                  "entry Type",
                  "conflict",
                  "sources",
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
              {catalogue.length === 0 && (
                <tr className="border-b border-border">
                  {Array(11).fill(null).map((_, i) => (
                    <td key={i} className="px-3 py-2 text-muted-foreground">-</td>
                  ))}
                </tr>
              )}

              {catalogue.map((item, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="px-3 py-2 text-foreground">{item.ip}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.hostname ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.mac ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.vendor ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.deviceType ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.latencyMs ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.asn ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {avgRTT(item) ? `${avgRTT(item)}ms` : "-"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{item.entryType ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.conflict ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {item.sources.length > 0 ? item.sources.join(" ") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
