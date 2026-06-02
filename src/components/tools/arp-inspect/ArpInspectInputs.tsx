"use client";

import { useState } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { useArpStore } from "@/store/arp";
import { useCapabilitiesStore } from "@/store/capabilities";
import { cn } from "@/lib/utils";

export interface ArpInspectConfig {
  target: string;
  interface: "ETH0" | "EN0";
  timeout: number;
}

export interface ArpInspectInputsProps {
  isRunning: boolean;
  onRun: (config: ArpInspectConfig) => void;
  onStop: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function ArpInspectInputs({
  isRunning,
  onRun,
  onStop,
  onResume,
  onReset,
}: ArpInspectInputsProps) {
  const [target, setTarget] = useState("");
  const [_interface, setInterface] = useState<ArpInspectConfig["interface"]>("ETH0");
  const [timeout, setTimeout] = useState(5);

  const { isPaused, setIsPaused } = useArpStore();
  const { isRemoteDeployment } = useCapabilitiesStore();

  const handleRun = () => {
    // TEMPORARILY ADD THIS FOR MOCK DATA TESTING
    setTarget("SAMPLE.SUBNET.1.0/24");
    // if (!target.trim()) return;
    setIsPaused(false);
    onRun({ target: target.trim(), interface: _interface, timeout });
  };

  const handleResume = () => { setIsPaused(false); onResume(); };
  const handleStop = () => { setIsPaused(true); onStop(); };
  const handleReset = () => { setIsPaused(false); onReset(); };

  return (
    <div className="flex flex-col gap-3 p-4 mb-5 bg-card border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[11px] uppercase text-muted-foreground">
          ARP Configuration
        </span>
        {isRemoteDeployment && (
          <span className="text-[10px] uppercase text-amber-500">
            Simulation Mode
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isRunning && !isRemoteDeployment && handleRun()}
          placeholder={isRemoteDeployment ? "Unavailable in remote mode" : "Your LAN subnet (e.g. 192.168.1.0/24)"}
          disabled={isRemoteDeployment}
          className={cn(
            "flex-1 px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground",
            "placeholder:text-muted-foreground",
            isRemoteDeployment && "opacity-50 cursor-not-allowed text-muted-foreground"
          )}
        />

        {/* Interface selector */}
        <div className="flex items-center overflow-hidden flex-shrink-0">
          {(["ETH0", "EN0"] as const).map((i) => (
            <button
              key={i}
              onClick={() => setInterface(i)}
              className={cn(
                "px-3 py-2 text-[12px] transition-colors duration-150 border-t border-b border-l border-border",
                _interface === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {i}
            </button>
          ))}
        </div>

        {/* Run / Stop / Resume */}
        <button
          onClick={isRunning && !isPaused ? handleStop : isPaused ? handleResume : handleRun}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 text-[12px] transition-colors duration-150 flex-shrink-0 border",
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
          className="flex items-center justify-center gap-2 px-4 py-2 text-[12px] transition-colors duration-150 flex-shrink-0 border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>
    </div>
  );
}
