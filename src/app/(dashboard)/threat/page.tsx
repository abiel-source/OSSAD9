export default function ThreatPage() {
  const severityLevels = ["All", "Critical", "High", "Medium", "Low", "Info"];
  const columns = ["Severity", "Host", "Description", "Category", "Detected"];

  return (
    <div className="space-y-5 max-w-screen-xl">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-base font-semibold tracking-wide"
            style={{ color: "var(--ossad-text-primary)" }}
          >
            Threat
          </h1>
          <p
            className="text-xs font-mono mt-0.5"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            Security analysis — anomaly detection, CVE lookup, IP reputation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border"
            style={{ borderColor: "var(--ossad-border)" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--ossad-border)" }}
            />
            <span
              className="text-[10px] font-mono tracking-[0.16em] uppercase"
              style={{ color: "var(--ossad-text-secondary)" }}
            >
              0 Alerts
            </span>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Critical", color: "var(--ossad-catastrophic)" },
          { label: "High",     color: "#F97316"               },
          { label: "Medium",   color: "var(--ossad-cautious)"  },
          { label: "Low",      color: "var(--ossad-text-secondary)" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[3px] border p-3 flex items-center gap-3"
            style={{
              backgroundColor: "var(--ossad-bg-surface)",
              borderColor: "var(--ossad-border)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <p
                className="text-[10px] font-mono tracking-[0.14em] uppercase"
                style={{ color: item.color }}
              >
                {item.label}
              </p>
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--ossad-text-primary)" }}
              >
                0
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Severity filter */}
      <div className="flex items-center gap-1.5">
        {severityLevels.map((level, i) => (
          <button
            key={level}
            className="px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase rounded-[3px] border"
            style={{
              borderColor: i === 0 ? "var(--ossad-accent)" : "var(--ossad-border)",
              color: i === 0 ? "var(--ossad-accent)" : "var(--ossad-text-secondary)",
              backgroundColor: i === 0 ? "var(--ossad-accent-glow)" : "transparent",
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Alert table */}
      <div
        className="rounded-[3px] border overflow-hidden"
        style={{
          backgroundColor: "var(--ossad-bg-surface)",
          borderColor: "var(--ossad-border)",
        }}
      >
        {/* Header row */}
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: "1fr 2fr 3fr 1.5fr 1.5fr",
            borderColor: "var(--ossad-border)",
            backgroundColor: "var(--ossad-bg-elevated)",
          }}
        >
          {columns.map((col) => (
            <div
              key={col}
              className="px-4 py-2.5 text-[10px] font-mono tracking-[0.16em] uppercase"
              style={{ color: "var(--ossad-text-secondary)" }}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className="flex items-center justify-center py-14">
          <span
            className="text-[11px] font-mono"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            No threats detected — network not yet analyzed.
          </span>
        </div>
      </div>
    </div>
  );
}
