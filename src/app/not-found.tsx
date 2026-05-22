import Link from "next/link";
import { Radar, MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">

      {/* Card */}
      <div className="w-full max-w-md border border-border bg-card p-10 flex flex-col gap-8">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Radar size={16} className="text-foreground flex-shrink-0" />
          <span className="text-[15px] font-bold text-foreground">OSSAD-9</span>
        </div>

        {/* Error content */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
            Error
          </span>
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-[13px] text-muted-foreground">
            Route not found. The path you requested does not exist or has been moved.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Back link */}
        <Link
          href="/overview"
          className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <MoveLeft size={14} className="flex-shrink-0" />
          Back to Overview
        </Link>
      </div>

    </div>
  );
}
