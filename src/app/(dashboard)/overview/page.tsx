import { LayoutDashboard } from "lucide-react";

export default function OverviewPage() {
  const statCards = [
    { label: "Active Hosts",     value: "—",   unit: ""    },
    { label: "Open Ports",       value: "—",   unit: ""    },
    { label: "Avg Latency",      value: "—",   unit: "ms"  },
    { label: "Threat Alerts",    value: "—",   unit: ""    },
  ];

  const panels = [
    { title: "Network Health",   height: "h-56" },
    { title: "Recent Events",    height: "h-56" },
    { title: "Bandwidth Usage",  height: "h-56" },
    { title: "Top Hosts",        height: "h-56" },
  ];

  return (
    <div className="space-y-7 max-w-screen-xl">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <LayoutDashboard size={32} className="flex-shrink-0 text-foreground" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Network & Developer Toolkit
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            System-wide status. No network target configured.
          </p>
        </div>

        <button className="flex items-center gap-3 px-4 py-2 text-[14px] tracking-widest uppercase border border-border text-muted-foreground bg-card hover:bg-accent hover:text-accent-foreground transition-colors duration-150">
          Configure Target
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="border border-border bg-card p-5"
          >
            <p className="text-[12px] tracking-[0.16em] uppercase mb-3 text-muted-foreground">
              {card.label}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-foreground">
                {card.value}
              </span>
              {card.unit && (
                <span className="text-sm text-muted-foreground">
                  {card.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {panels.map((panel) => (
          <div
            key={panel.title}
            className={`border border-border bg-card ${panel.height}`}
          >
            {/* Panel header */}
            <div className="flex items-center px-5 h-11 border-b border-border">
              <span className="text-[12px] tracking-[0.16em] uppercase text-muted-foreground">
                {panel.title}
              </span>
            </div>

            {/* Empty state */}
            <div className="flex items-center justify-center h-[calc(100%-44px)]">
              <span className="text-[14px] text-border">
                No data — target not configured
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
