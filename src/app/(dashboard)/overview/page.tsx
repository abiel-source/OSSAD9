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
          <h1 className="text-base font-semibold tracking-wide text-foreground font-heading">
            Overview
          </h1>
          <p className="text-xs font-mono mt-0.5 text-muted-foreground">
            System-wide status. No network target configured.
          </p>
        </div>

        <button className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono tracking-widest uppercase border border-border text-muted-foreground bg-card hover:bg-accent hover:text-accent-foreground transition-colors duration-150">
          Configure Target
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="border border-border bg-card p-4"
          >
            <p className="text-[10px] font-mono tracking-[0.16em] uppercase mb-2 text-muted-foreground">
              {card.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-foreground">
                {card.value}
              </span>
              {card.unit && (
                <span className="text-xs font-mono text-muted-foreground">
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
            className={`border border-border bg-card ${panel.height}`}
          >
            {/* Panel header */}
            <div className="flex items-center px-4 h-9 border-b border-border">
              <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-muted-foreground">
                {panel.title}
              </span>
            </div>

            {/* Empty state */}
            <div className="flex items-center justify-center h-[calc(100%-36px)]">
              <span className="text-[11px] font-mono text-border">
                No data — target not configured
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
