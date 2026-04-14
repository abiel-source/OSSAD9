export default function OverviewPage() {
  const statCards = [
    { label: "Active Hosts",     value: "—",   unit: ""    },
    { label: "Open Ports",       value: "—",   unit: ""    },
    { label: "Avg Latency",      value: "—",   unit: "ms"  },
    { label: "Threat Alerts",    value: "—",   unit: ""    },
  ];

  const panels = [
    { title: "Network Health",   height: "h-48" },
    { title: "Recent Events",    height: "h-48" },
    { title: "Bandwidth Usage",  height: "h-48" },
    { title: "Top Hosts",        height: "h-48" },
  ];

  return (
    <div className="space-y-6 max-w-screen-xl">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-base font-semibold tracking-wide"
            style={{ color: "var(--ossad-text-primary)" }}
          >
            Overview
          </h1>
          <p
            className="text-xs font-mono mt-0.5"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            System-wide status. No network target configured.
          </p>
        </div>

        <button
          className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono tracking-widest uppercase rounded-[3px] border transition-colors duration-150"
          style={{
            borderColor: "var(--ossad-border)",
            color: "var(--ossad-text-secondary)",
          }}
        >
          Configure Target
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[3px] border p-4"
            style={{
              backgroundColor: "var(--ossad-bg-surface)",
              borderColor: "var(--ossad-border)",
            }}
          >
            <p
              className="text-[10px] font-mono tracking-[0.16em] uppercase mb-2"
              style={{ color: "var(--ossad-text-secondary)" }}
            >
              {card.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span
                className="text-2xl font-semibold"
                style={{ color: "var(--ossad-text-primary)" }}
              >
                {card.value}
              </span>
              {card.unit && (
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--ossad-text-secondary)" }}
                >
                  {card.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {panels.map((panel) => (
          <div
            key={panel.title}
            className={`rounded-[3px] border ${panel.height}`}
            style={{
              backgroundColor: "var(--ossad-bg-surface)",
              borderColor: "var(--ossad-border)",
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center px-4 h-9 border-b"
              style={{ borderColor: "var(--ossad-border)" }}
            >
              <span
                className="text-[10px] font-mono tracking-[0.16em] uppercase"
                style={{ color: "var(--ossad-text-secondary)" }}
              >
                {panel.title}
              </span>
            </div>

            {/* Empty state */}
            <div className="flex items-center justify-center h-[calc(100%-36px)]">
              <span
                className="text-[11px] font-mono"
                style={{ color: "var(--ossad-border)" }}
              >
                No data — target not configured
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
