export default function IntelPage() {
  const lookupTypes = ["DNS Lookup", "WHOIS / RDAP", "BGP / ASN", "Geolocation", "Reverse DNS"];
  const dnsRecordTypes = ["A", "AAAA", "MX", "TXT", "CNAME", "NS", "SOA"];

  return (
    <div className="space-y-5 max-w-screen-xl">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-base font-semibold tracking-wide"
            style={{ color: "var(--ossad-text-primary)" }}
          >
            Intel
          </h1>
          <p
            className="text-xs font-mono mt-0.5"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            Passive intelligence — DNS, WHOIS, BGP, geolocation, reverse DNS.
          </p>
        </div>
      </div>

      {/* Query bar */}
      <div
        className="rounded-[3px] border p-4"
        style={{
          backgroundColor: "var(--ossad-bg-surface)",
          borderColor: "var(--ossad-border)",
        }}
      >
        <div className="flex items-center gap-2">
          {/* Lookup type selector */}
          <select
            className="px-3 py-1.5 text-[11px] font-mono rounded-[3px] border outline-none"
            style={{
              backgroundColor: "var(--ossad-bg-elevated)",
              borderColor: "var(--ossad-border)",
              color: "var(--ossad-text-dim)",
            }}
          >
            {lookupTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="domain.com or IP address"
            className="flex-1 px-3 py-1.5 text-xs font-mono rounded-[3px] border outline-none"
            style={{
              backgroundColor: "var(--ossad-bg-elevated)",
              borderColor: "var(--ossad-border)",
              color: "var(--ossad-text-primary)",
            }}
          />

          <button
            className="px-3 py-1.5 text-[11px] font-mono tracking-widest uppercase rounded-[3px] border"
            style={{
              borderColor: "var(--ossad-accent)",
              color: "var(--ossad-accent)",
              backgroundColor: "var(--ossad-accent-glow)",
            }}
          >
            Query
          </button>
        </div>
      </div>

      {/* DNS record type filter */}
      <div className="flex items-center gap-1.5">
        {dnsRecordTypes.map((type, i) => (
          <button
            key={type}
            className="px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase rounded-[3px] border transition-colors duration-150"
            style={{
              borderColor: i === 0 ? "var(--ossad-accent)" : "var(--ossad-border)",
              color: i === 0 ? "var(--ossad-accent)" : "var(--ossad-text-secondary)",
              backgroundColor: i === 0 ? "var(--ossad-accent-glow)" : "transparent",
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Results panel */}
      <div
        className="rounded-[3px] border"
        style={{
          backgroundColor: "var(--ossad-bg-surface)",
          borderColor: "var(--ossad-border)",
          minHeight: 360,
        }}
      >
        <div
          className="flex items-center px-4 h-9 border-b"
          style={{ borderColor: "var(--ossad-border)" }}
        >
          <span
            className="text-[10px] font-mono tracking-[0.16em] uppercase"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            Results
          </span>
        </div>
        <div className="flex items-center justify-center" style={{ height: 320 }}>
          <span
            className="text-[11px] font-mono"
            style={{ color: "var(--ossad-border)" }}
          >
            Enter a domain or IP address and run a query
          </span>
        </div>
      </div>
    </div>
  );
}
