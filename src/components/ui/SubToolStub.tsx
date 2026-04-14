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
        <h1
          className="text-base font-semibold tracking-wide"
          style={{ color: "var(--ossad-text-primary)" }}
        >
          {title}
        </h1>
        <p
          className="text-xs font-mono mt-0.5"
          style={{ color: "var(--ossad-text-secondary)" }}
        >
          {description}
        </p>
      </div>

      {/* Empty canvas */}
      <div
        className="rounded-[3px] border flex flex-col items-center justify-center gap-2"
        style={{
          backgroundColor: "var(--ossad-bg-surface)",
          borderColor: "var(--ossad-border)",
          height: "calc(100vh - 196px)",
          minHeight: 400,
        }}
      >
        <div
          className="w-6 h-6 rounded-[3px] border flex items-center justify-center mb-1"
          style={{ borderColor: "var(--ossad-border)" }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--ossad-border)" }}
          />
        </div>
        <p
          className="text-[11px] font-mono"
          style={{ color: "var(--ossad-text-secondary)" }}
        >
          {title} — not yet implemented
        </p>
        <p
          className="text-[10px] font-mono"
          style={{ color: "var(--ossad-border)" }}
        >
          This sub-tool is in the build queue
        </p>
      </div>
    </div>
  );
}
