export default function Footer() {
  const links = ["About", "Docs", "Privacy", "Terms"];

  return (
    <footer className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 flex-shrink-0 border-t border-border">
      {/* App name + copyright */}
      <div className="flex flex-col gap-1">
        <span className="text-[14px] font-bold tracking-[0.2em] uppercase text-foreground">
          OSSAD-9
        </span>
        <span className="text-[12px] text-muted-foreground">
          © 2026 OSSAD-9. All rights reserved.
        </span>
      </div>

      {/* Stubbed links */}
      <div className="flex items-center gap-5">
        {links.map((link) => (
          <a
            key={link}
            href="#"
            className="text-[12px] tracking-[0.1em] text-muted-foreground hover:text-foreground hover:underline transition-colors duration-150"
          >
            {link}
          </a>
        ))}
      </div>

      {/* Global compliance badges */}
      <div className="flex items-center gap-3">
        {["WCAG AA", "SOC 2"].map((label) => (
          <div
            key={label}
            className="px-3 py-1 text-[11px] tracking-[0.15em] uppercase border border-border bg-muted/20 text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>
    </footer>
  );
}
