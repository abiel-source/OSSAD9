export default function ConsolePage() {
  const quickCommands = [
    { label: "ping",       example: "ping 192.168.1.1"          },
    { label: "traceroute", example: "traceroute google.com"      },
    { label: "dig",        example: "dig google.com A"           },
    { label: "nmap",       example: "nmap -sV 192.168.1.1"      },
    { label: "whois",      example: "whois google.com"           },
    { label: "curl",       example: "curl -I https://google.com" },
  ];

  return (
    <div className="space-y-5 max-w-screen-xl">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-wide text-foreground font-heading">
            Console
          </h1>
          <p className="text-xs font-mono mt-0.5 text-muted-foreground">
            Raw tool runner — ping, traceroute, dig, nmap, whois, curl.
          </p>
        </div>
      </div>

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "200px 1fr",
          height: "calc(100vh - 190px)",
          minHeight: 500,
        }}
      >
        {/* Quick commands */}
        <div className="border border-border bg-card flex flex-col">
          <div className="flex items-center px-4 h-9 border-b border-border flex-shrink-0">
            <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-muted-foreground">
              Commands
            </span>
          </div>

          <div className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {quickCommands.map((cmd, i) => (
              <button
                key={cmd.label}
                className="w-full flex flex-col gap-0.5 px-3 py-2.5 text-left transition-colors duration-150"
                style={{
                  backgroundColor: i === 0 ? "color-mix(in oklch, var(--primary) 10%, transparent)" : "transparent",
                  borderLeft: i === 0 ? "2px solid var(--primary)" : "2px solid transparent",
                }}
              >
                <span
                  className="text-[11px] font-mono font-medium"
                  style={{ color: i === 0 ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {cmd.label}
                </span>
                <span className="text-[9px] font-mono truncate text-muted-foreground">
                  {cmd.example}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Terminal area */}
        <div className="border border-border bg-card flex flex-col">
          {/* Terminal header */}
          <div className="flex items-center gap-3 px-4 h-9 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#EF4444", opacity: 0.6 }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#F59E0B", opacity: 0.6 }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#10B981", opacity: 0.6 }} />
            </div>
            <div className="h-3.5 w-px bg-border" />
            <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-muted-foreground">
              Output
            </span>
          </div>

          {/* Terminal output area */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
            <p className="text-muted-foreground">
              <span className="text-primary">ossad@9</span>
              <span className="text-muted-foreground"> ~ </span>
              <span className="opacity-0 animate-pulse">█</span>
            </p>
          </div>

          {/* Command input */}
          <div className="flex items-center gap-2 px-4 h-10 border-t border-border flex-shrink-0">
            <span className="text-xs font-mono flex-shrink-0 text-primary">$</span>
            <input
              type="text"
              placeholder="Enter command..."
              className="flex-1 bg-transparent outline-none text-xs font-mono text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
