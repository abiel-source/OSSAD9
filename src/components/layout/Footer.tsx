export default function Footer() {
  const links = ["About", "Docs", "Privacy", "Terms"];

  return (
    <footer
      className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0"
      style={{ borderTop: "1px solid var(--ossad-border)" }}
    >
      {/* App name + copyright */}
      <div className="flex flex-col gap-0.5">
        <span
          className="text-[11px] font-bold tracking-[0.2em] uppercase"
          style={{ color: "var(--ossad-accent)" }}
        >
          OSSAD-9
        </span>
        <span
          className="text-[10px] font-mono"
          style={{ color: "var(--ossad-text-secondary)" }}
        >
          © 2026 OSSAD-9. All rights reserved.
        </span>
      </div>

      {/* Stubbed links */}
      <div className="flex items-center gap-4">
        {links.map((link) => (
          <a
            key={link}
            href="#"
            className="text-[10px] font-mono tracking-[0.1em] hover:underline"
            style={{ color: "var(--ossad-text-secondary)" }}
          >
            {link}
          </a>
        ))}
      </div>

      {/* Global compliance badges */}
      <div className="flex items-center gap-2">
        {["WCAG AA", "SOC 2"].map((label) => (
          <div
            key={label}
            className="px-2 py-[3px] rounded-[3px] text-[9px] font-mono tracking-[0.15em] uppercase"
            style={{
              border: "1px solid rgba(148,163,184,0.2)",
              backgroundColor: "rgba(148,163,184,0.04)",
              color: "var(--ossad-text-secondary)",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </footer>
  );
}
