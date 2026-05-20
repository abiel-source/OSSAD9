interface ComplianceBadgeProps {
  rfcBadge: string;
}

export function ComplianceBadge({ rfcBadge }: ComplianceBadgeProps) {
  return (
    <div className="px-2 py-[3px] text-[9px] font-mono tracking-[0.15em] uppercase bg-primary text-primary-foreground">
      {rfcBadge}
    </div>
  );
}
