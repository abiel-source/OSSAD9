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
              {catalogue.length === 0 && (
                <tr
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
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{
                      color: "var(--ossad-text-secondary)",
                    }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{
                      color: "var(--ossad-text-secondary)",
                    }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{
                      color: "var(--ossad-text-secondary)",
                    }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{
                      color: "var(--ossad-text-secondary)",
                    }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{
                      color: "var(--ossad-text-secondary)",
                    }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{
                      color: "var(--ossad-text-secondary)",
                    }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{
                      color: "var(--ossad-text-secondary)",
                    }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{
                      color: "var(--ossad-text-secondary)",
                    }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{
                      color: "var(--ossad-text-secondary)",
                    }}
                  >
                    -
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{
                      color: "var(--ossad-text-secondary)",
                    }}
                  >
                    -
                  </td>
                </tr>
              )}

              {catalogue.map((item, idx) => {
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
                        color: "var(--ossad-text-primary)",
                      }}
                    >
                      {item.ip}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {item.hostname ?? "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {item.mac ?? "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {item.vendor ?? "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {item.deviceType ?? "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {item.latencyMs ?? "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {item.asn ?? "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {avgRTT(item) ? `${avgRTT(item)}ms` : "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {item.entryType ?? "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {item.conflict ?? "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{
                        color: "var(--ossad-text-secondary)",
                      }}
                    >
                      {item.sources.length > 0 ? item.sources.join(" ") : "-"}
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
