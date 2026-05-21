interface ComplianceBadgeProps {
  rfcBadge: string;
}

export function ComplianceBadge({ rfcBadge }: ComplianceBadgeProps) {
  return (
    <div className="px-3 py-1 text-[11px] tracking-[0.15em] uppercase bg-primary text-primary-foreground">
      {rfcBadge}
    </div>
  );
}
