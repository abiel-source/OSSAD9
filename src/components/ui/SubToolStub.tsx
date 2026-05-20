interface SubToolStubProps {
  title: string;
  description: string;
}

/**
 * Shared placeholder for sub-tool pages not yet implemented.
 * Provides consistent empty-state structure across all sub-tools.
 * REPLACE BEFORE DEPLOY
 */
export default function SubToolStub({ title, description }: SubToolStubProps) {
  return (
    <div className="space-y-5 max-w-screen-xl">
      {/* Header */}
      <div>
        <h1 className="text-base font-semibold tracking-wide text-foreground font-heading">
          {title}
        </h1>
        <p className="text-xs font-mono mt-0.5 text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Empty canvas */}
      <div
        className="border border-border bg-card flex flex-col items-center justify-center gap-2"
        style={{ height: "calc(100vh - 196px)", minHeight: 400 }}
      >
        <div className="w-6 h-6 border border-border flex items-center justify-center mb-1">
          <div className="w-2 h-2 rounded-full bg-border" />
        </div>
        <p className="text-[11px] font-mono text-muted-foreground">
          {title} — not yet implemented
        </p>
        <p className="text-[10px] font-mono text-border">
          This sub-tool is in the build queue
        </p>
      </div>
    </div>
  );
}
