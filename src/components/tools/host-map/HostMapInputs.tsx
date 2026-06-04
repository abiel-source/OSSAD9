"use client";

import { useState } from "react";
import { Play, RotateCcw, Loader } from "lucide-react";
import { useCapabilitiesStore } from "@/store/capabilities";
import { cn } from "@/lib/utils";

export interface HostMapConfig {
  target: string;
}

interface HostMapInputsProps {
  isRunning: boolean;
  onRun: (config: HostMapConfig) => void;
  onReset: () => void;
}

export function HostMapInputs({
  isRunning,
  onRun,
  onReset,
}: HostMapInputsProps) {
  const [target, setTarget] = useState("");
  const { isRemoteDeployment, hasNmap, environment } = useCapabilitiesStore();

  const placeholder = isRemoteDeployment
    ? "Host map is simulated for remote deployments: Enter a dummy subnet"
    : !hasNmap && environment === "electron"
      ? "nmap not found: Host map is simulated"
      : !hasNmap && environment === "local"
        ? "nmap not installed: Host map is simulated"
        : "Your LAN subnet (e.g. 192.168.1.0/24)";

  const handleRun = () => {
    if (!target.trim()) return;
    onRun({ target });
  };

  return (
    <div className="flex flex-col p-4 mb-5 gap-3 bg-card border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[11px] uppercase text-muted-foreground">
          Target Configuration
        </span>
      </div>

      {/* Main row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isRunning && handleRun()}
          placeholder={placeholder}
          className={cn(
            "flex-1 px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground",
            "placeholder:text-muted-foreground",
          )}
        />

        {/* Run / Reset */}
        <button
          onClick={handleRun}
          disabled={isRunning}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 text-[12px] transition-colors duration-150 flex-shrink-0 border",
            "bg-primary border-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isRunning ? (
            <Loader size={12} className="animate-spin" />
          ) : (
            <Play size={12} />
          )}
          {isRunning ? "Running..." : "Play"}
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-4 py-2 text-[12px] transition-colors duration-150 flex-shrink-0 border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>
    </div>
  );
}
