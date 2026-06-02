interface ComplianceBadgeProps {
  rfcBadge: string;
}

export function ComplianceBadge({ rfcBadge }: ComplianceBadgeProps) {
  return (
    <div className="px-3 py-1 text-[11px] uppercase bg-primary text-primary-foreground">
      {rfcBadge}
    </div>
  );
}
