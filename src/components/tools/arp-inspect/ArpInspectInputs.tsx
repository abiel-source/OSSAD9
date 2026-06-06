"use client";

import { useState } from "react";
import { Play, Loader, RotateCcw } from "lucide-react";
import { useCapabilitiesStore } from "@/store/capabilities";
import { cn } from "@/lib/utils";

export interface ArpInspectConfig {
  cidr: string;
  interface: "ETH0" | "EN0";
  timeout: number;
}

export interface ArpInspectInputsProps {
  isRunning: boolean;
  onRun: (config: ArpInspectConfig) => void;
  onReset: () => void;
}

export function ArpInspectInputs({
  isRunning,
  onRun,
  onReset,
}: ArpInspectInputsProps) {
  const [cidr, setCidr] = useState("");
  const [_interface, setInterface] =
    useState<ArpInspectConfig["interface"]>("ETH0");
  const [timeout, setTimeout] = useState(5);

  const { isRemoteDeployment } = useCapabilitiesStore();

  const handleRun = () => {
    if (!cidr.trim()) return;
    onRun({ cidr: cidr.trim(), interface: _interface, timeout });
  };

  return (
    <div className="flex flex-col gap-3 p-4 mb-5 bg-card border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[11px] uppercase text-muted-foreground">
          ARP Configuration
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={cidr}
          onChange={(e) => setCidr(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isRunning && handleRun()}
          placeholder={
            isRemoteDeployment
              ? "Arp Inspector is simulated for remote deployments: Enter a dummy subnet"
              : "Your LAN subnet (e.g. 192.168.1.0/24)"
          }
          className={cn(
            "flex-1 px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground",
            "placeholder:text-muted-foreground",
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
                  : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {i}
            </button>
          ))}
        </div>

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
