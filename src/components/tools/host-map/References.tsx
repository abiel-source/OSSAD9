import { useState } from "react";
import { Copy, Check } from "lucide-react";

async function handleCopy(cidr: string, setCopied: (cidr: string) => void) {
  await navigator.clipboard.writeText(cidr);
  setCopied(cidr);
}

export function References() {
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div className="mb-5">
      {/* Header */}
      <div className="mt-5 border border-border bg-card overflow-hidden">
        <div className="px-3 py-2 border-b border-border">
          <span className="text-[11px] uppercase text-muted-foreground">
            Address Range Reference
          </span>
        </div>

        {/* References */}
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
              {
                range: "10.0.0.0/8",
                desc: "Private — Class A",
                rfc: "RFC 1918",
                group: "private",
              },
              {
                range: "172.16.0.0/12",
                desc: "Private — Class B",
                rfc: "RFC 1918",
                group: "private",
              },
              {
                range: "192.168.0.0/16",
                desc: "Private — Class C",
                rfc: "RFC 1918",
                group: "private",
              },
              {
                range: "127.0.0.0/8",
                desc: "Loopback",
                rfc: "RFC 1122",
                group: "special",
              },
              {
                range: "169.254.0.0/16",
                desc: "Link-local / APIPA",
                rfc: "RFC 3927",
                group: "special",
              },
              {
                range: "100.64.0.0/10",
                desc: "Shared address space (CGNAT)",
                rfc: "RFC 6598",
                group: "special",
              },
              {
                range: "192.0.2.0/24",
                desc: "Documentation (TEST-NET-1)",
                rfc: "RFC 5737",
                group: "doc",
              },
              {
                range: "198.51.100.0/24",
                desc: "Documentation (TEST-NET-2)",
                rfc: "RFC 5737",
                group: "doc",
              },
              {
                range: "203.0.113.0/24",
                desc: "Documentation (TEST-NET-3)",
                rfc: "RFC 5737",
                group: "doc",
              },
              {
                range: "224.0.0.0/4",
                desc: "Multicast",
                rfc: "RFC 5771",
                group: "special",
              },
              {
                range: "240.0.0.0/4",
                desc: "Reserved / Experimental",
                rfc: "RFC 1112",
                group: "special",
              },
              {
                range: "255.255.255.255/32",
                desc: "Limited broadcast",
                rfc: "RFC 919",
                group: "special",
              },
            ].map((row) => (
              <tr
                key={row.range}
                className="border-b border-border last:border-b-0"
              >
                <td className="px-3 py-2 text-foreground w-44">
                  <div className="flex gap-2 items-center">
                    <button
                      className="cursor-pointer"
                      onClick={async () =>
                        await handleCopy(row.range, setCopied)
                      }
                    >
                      {copied === row.range ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                    <div>{row.range}</div>
                  </div>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{row.desc}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                  {row.rfc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
