interface ToolHeaderButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export function ToolHeaderButton({ label, icon, onClick }: ToolHeaderButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1 text-[12px] tracking-[0.08em] transition-colors duration-150 border border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      {icon}
      {label}
    </button>
  );
}
