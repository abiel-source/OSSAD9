"use client";

import { useState } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { useTopologyStore } from "@/store/topology";
import { useCapabilitiesStore } from "@/store/capabilities";

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

  // Disabled when remote OR when nmap is not installed locally
  const isDisabled = isRemoteDeployment || !hasNmap;

  // Badge shown in header
  const badge = isRemoteDeployment
    ? { label: "Simulation Mode", color: "var(--ossad-cautious)", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" }
    : !hasNmap
    ? { label: "nmap not found", color: "var(--ossad-catastrophic)", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" }
    : null;

  // Placeholder text
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
    onRun({ target: target });
  };

  const handleStop = () => {
    setIsPaused(true);
    onStop();
  };

  const handleResume = () => {
    setIsPaused(false);
    onResume();
  };

  const handleReset = () => {
    setIsPaused(false);
    onReset();
  };

  return (
    <div
      className="flex flex-col p-4 rounded-[3px] mb-6 gap-3"
      style={{
        border: "1px solid var(--ossad-border)",
        backgroundColor: "var(--ossad-bg-surface)",
      }}
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className="text-[10px] font-mono tracking-[0.16em] uppercase"
          style={{ color: "var(--ossad-text-secondary)" }}
        >
          Target Configuration
        </span>
        {badge && (
          <span
            className="text-[9px] font-mono tracking-[0.12em] uppercase px-2 py-0.5 rounded-[3px]"
            style={{
              backgroundColor: badge.bg,
              border: `1px solid ${badge.border}`,
              color: badge.color,
            }}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Main row: target + run */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isRunning && !isDisabled && handleRun()}
          placeholder={placeholder}
          disabled={isDisabled}
          className="flex-1 px-3 py-2 rounded-[3px] text-[12px] font-mono outline-none"
          style={{
            backgroundColor: "var(--ossad-bg-elevated)",
            border: "1px solid var(--ossad-border)",
            color: isDisabled ? "var(--ossad-text-secondary)" : "var(--ossad-text-primary)",
            cursor: isDisabled ? "not-allowed" : "text",
            opacity: isDisabled ? 0.5 : 1,
          }}
        />

        {/* Run / Stop / Resume */}
        <button
          onClick={
            isRunning && !isPaused
              ? handleStop
              : isPaused
              ? handleResume
              : handleRun
          }
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-[3px] text-[11px] font-mono tracking-[0.08em] transition-colors duration-150 flex-shrink-0"
          style={{
            backgroundColor:
              isRunning && !isPaused
                ? "rgba(239,68,68,0.1)"
                : "rgba(54,123,240,0.12)",
            border:
              isRunning && !isPaused
                ? "1px solid rgba(239,68,68,0.3)"
                : "1px solid rgba(54,123,240,0.3)",
            color:
              isRunning && !isPaused
                ? "var(--ossad-catastrophic)"
                : "var(--ossad-accent)",
          }}
        >
          {isRunning && !isPaused ? (
            <Square size={12} />
          ) : isPaused ? (
            <Play size={12} />
          ) : (
            <Play size={12} />
          )}
          {isRunning && !isPaused ? "Stop" : isPaused ? "Resume" : "Play"}
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          disabled={isRunning && !isPaused}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-[3px] text-[11px] font-mono tracking-[0.08em] transition-colors duration-150 flex-shrink-0"
          style={{
            backgroundColor: "var(--ossad-bg-elevated)",
            border: "1px solid var(--ossad-border)",
            color:
              isRunning && !isPaused
                ? "var(--ossad-text-dim)"
                : "var(--ossad-text-secondary)",
            cursor: isRunning && !isPaused ? "not-allowed" : "pointer",
          }}
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>
    </div>
  );
}
