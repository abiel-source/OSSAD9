interface ToolHeaderButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export function ToolHeaderButton({
  label,
  icon,
  onClick,
}: ToolHeaderButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-[5px] rounded-[3px] text-[10px] font-mono tracking-[0.08em] transition-colors duration-150"
      style={{
        border: "1px solid var(--ossad-border)",
        backgroundColor: "var(--ossad-bg-elevated)",
        color: "var(--ossad-text-secondary)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
