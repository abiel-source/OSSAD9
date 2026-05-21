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
          <h1 className="text-lg font-semibold tracking-wide text-foreground font-heading">
            Console
          </h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Raw tool runner — ping, traceroute, dig, nmap, whois, curl.
          </p>
        </div>
      </div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "200px 1fr",
          height: "calc(100vh - 190px)",
          minHeight: 500,
        }}
      >
        {/* Quick commands */}
        <div className="border border-border bg-card flex flex-col">
          <div className="flex items-center px-5 h-11 border-b border-border flex-shrink-0">
            <span className="text-[12px] tracking-[0.16em] uppercase text-muted-foreground">
              Commands
            </span>
          </div>

          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            {quickCommands.map((cmd, i) => (
              <button
                key={cmd.label}
                className="w-full flex flex-col gap-1 px-4 py-3 text-left transition-colors duration-150"
                style={{
                  backgroundColor: i === 0 ? "color-mix(in oklch, var(--primary) 10%, transparent)" : "transparent",
                  borderLeft: i === 0 ? "2px solid var(--primary)" : "2px solid transparent",
                }}
              >
                <span
                  className="text-[14px] font-mono font-medium"
                  style={{ color: i === 0 ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {cmd.label}
                </span>
                <span className="text-[11px] font-mono truncate text-muted-foreground">
                  {cmd.example}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Terminal area */}
        <div className="border border-border bg-card flex flex-col">
          {/* Terminal header */}
          <div className="flex items-center gap-4 px-5 h-11 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EF4444", opacity: 0.6 }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F59E0B", opacity: 0.6 }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10B981", opacity: 0.6 }} />
            </div>
            <div className="h-3.5 w-px bg-border" />
            <span className="text-[12px] tracking-[0.16em] uppercase text-muted-foreground">
              Output
            </span>
          </div>

          {/* Terminal output area */}
          <div className="flex-1 p-5 overflow-y-auto font-mono text-sm">
            <p className="text-muted-foreground">
              <span className="text-primary">ossad@9</span>
              <span className="text-muted-foreground"> ~ </span>
              <span className="opacity-0 animate-pulse">█</span>
            </p>
          </div>

          {/* Command input */}
          <div className="flex items-center gap-3 px-5 h-12 border-t border-border flex-shrink-0">
            <span className="text-sm font-mono flex-shrink-0 text-primary">$</span>
            <input
              type="text"
              placeholder="Enter command..."
              className="flex-1 bg-transparent outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
