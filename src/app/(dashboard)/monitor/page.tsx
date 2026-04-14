export default function MonitorPage() {
  const columns = ["Host", "IP Address", "Status", "Latency", "Uptime", "Last Seen"];

  return (
    <div className="space-y-5 max-w-screen-xl">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-base font-semibold tracking-wide"
            style={{ color: "var(--ossad-text-primary)" }}
          >
            Monitor
          </h1>
          <p
            className="text-xs font-mono mt-0.5"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            Real-time host uptime, latency, and event tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--ossad-border)" }}
            />
            <span
              className="text-[10px] font-mono tracking-[0.16em] uppercase"
              style={{ color: "var(--ossad-text-secondary)" }}
            >
              Idle
            </span>
          </div>
        </div>
      </div>

      {/* Latency chart placeholder */}
      <div
        className="rounded-[3px] border h-36"
        style={{
          backgroundColor: "var(--ossad-bg-surface)",
          borderColor: "var(--ossad-border)",
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
            Latency — Live
          </span>
        </div>
        <div className="flex items-center justify-center h-[calc(100%-36px)]">
          <span
            className="text-[11px] font-mono"
            style={{ color: "var(--ossad-border)" }}
          >
            Awaiting target
          </span>
        </div>
      </div>

      {/* Host table */}
      <div
        className="rounded-[3px] border overflow-hidden"
        style={{
          backgroundColor: "var(--ossad-bg-surface)",
          borderColor: "var(--ossad-border)",
        }}
      >
        {/* Table header */}
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1.5fr",
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
        <div
          className="flex items-center justify-center py-12"
        >
          <span
            className="text-[11px] font-mono"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            No hosts monitored — run discovery in Topology first.
          </span>
        </div>
      </div>
    </div>
  );
}
