interface ComplianceBadgeProps {
  rfcBadge: string;
}

export function ComplianceBadge({ rfcBadge }: ComplianceBadgeProps) {
  return (
    <div
      className="px-2 py-[3px] rounded-[3px] text-[9px] font-mono tracking-[0.15em] uppercase"
      style={{
        border: "1px solid rgba(54,123,240,0.25)",
        backgroundColor: "rgba(54,123,240,0.05)",
        color: "var(--ossad-accent)",
      }}
    >
      {rfcBadge}
    </div>
  );
}
