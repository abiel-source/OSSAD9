"use client";

import { useState } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { useTopologyStore } from "@/store/topology";
import { useCapabilitiesStore } from "@/store/capabilities";
import { cn } from "@/lib/utils";

export interface HostMapConfig {
  target: string;
}

interface HostMapInputsProps {
  isRunning: boolean;
  onRun: (config: HostMapConfig) => void;
  onStop: () => void;
  onReset: () => void;
  onResume: () => void;
}

export function HostMapInputs({
  isRunning,
  onRun,
  onStop,
  onReset,
  onResume,
}: HostMapInputsProps) {
  const [target, setTarget] = useState("");
  const { isPaused, setIsPaused } = useTopologyStore();
  const { isRemoteDeployment, hasNmap, environment } = useCapabilitiesStore();

  const isDisabled = isRemoteDeployment || !hasNmap;

  const badge = isRemoteDeployment
    ? { label: "Simulation Mode", cls: "text-amber-500" }
    : !hasNmap
    ? { label: "nmap not found", cls: "text-destructive" }
    : null;

  const placeholder = isRemoteDeployment
    ? "Unavailable in remote mode"
    : !hasNmap && environment === "electron"
    ? "nmap not found — reinstall the application"
    : !hasNmap && environment === "local"
    ? "nmap not installed — install from nmap.org"
    : "Your LAN subnet (e.g. 192.168.1.0/24)";

  const handleRun = () => {
    // TEMPORARILY ADD THIS FOR MOCK DATA TESTING
    setTarget("SAMPLE.SUBNET.1.0/24");
    // if (!target.trim()) return;
    setIsPaused(false);
    onRun({ target });
  };

  const handleStop = () => { setIsPaused(true); onStop(); };
  const handleResume = () => { setIsPaused(false); onResume(); };
  const handleReset = () => { setIsPaused(false); onReset(); };

  return (
    <div className="flex flex-col p-4 mb-5 gap-3 bg-card border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
          Target Configuration
        </span>
        {badge && (
          <span className={cn("text-[10px] tracking-[0.12em] uppercase px-2.5 py-0.5", badge.cls)}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Main row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isRunning && !isDisabled && handleRun()}
          placeholder={placeholder}
          disabled={isDisabled}
          className={cn(
            "flex-1 px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground",
            "placeholder:text-muted-foreground",
            isDisabled && "opacity-50 cursor-not-allowed text-muted-foreground"
          )}
        />

        {/* Run / Stop / Resume */}
        <button
          onClick={isRunning && !isPaused ? handleStop : isPaused ? handleResume : handleRun}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 text-[12px] tracking-[0.08em] transition-colors duration-150 flex-shrink-0 border",
            isRunning && !isPaused
              ? "bg-destructive border-destructive text-destructive-foreground"
              : "bg-primary border-primary text-primary-foreground"
          )}
        >
          {isRunning && !isPaused ? <Square size={12} /> : <Play size={12} />}
          {isRunning && !isPaused ? "Stop" : isPaused ? "Resume" : "Play"}
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          disabled={isRunning && !isPaused}
          className="flex items-center justify-center gap-2 px-4 py-2 text-[12px] tracking-[0.08em] transition-colors duration-150 flex-shrink-0 border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>
    </div>
  );
}
