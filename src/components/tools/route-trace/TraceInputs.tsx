"use client";

import { useState } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { useRouteTraceStore } from "@/store/routetrace";
import { useCapabilitiesStore } from "@/store/capabilities";
import { cn } from "@/lib/utils";

export interface TraceConfig {
  target: string;
  protocol: "ICMP" | "UDP" | "TCP";
  maxHops: number;
  timeout: number;
  probes: number;
}

interface TraceInputsProps {
  isRunning: boolean;
  onRun: (config: TraceConfig) => void;
  onStop: () => void;
  onResume: () => void;
  onReset: () => void;
}

export default function TraceInputs({
  isRunning,
  onRun,
  onStop,
  onResume,
  onReset,
}: TraceInputsProps) {
  const [target, setTarget] = useState("");
  const [protocol, setProtocol] = useState<TraceConfig["protocol"]>("ICMP");
  const [maxHops, setMaxHops] = useState(30);
  const [timeout, setTimeout] = useState(5);
  const [probes, setProbes] = useState(3);

  const { isPaused, setIsPaused } = useRouteTraceStore();
  const { isRemoteDeployment, hasTraceroute, environment } = useCapabilitiesStore();

  const isDisabled = isRemoteDeployment || !hasTraceroute;

  const badge = isRemoteDeployment
    ? { label: "Simulation Mode", cls: "bg-amber-500/10 border border-amber-500/30 text-amber-500" }
    : !hasTraceroute
    ? { label: "traceroute not found", cls: "bg-destructive/10 border border-destructive/30 text-destructive" }
    : null;

  const placeholder = isRemoteDeployment
    ? "Unavailable in remote mode"
    : !hasTraceroute && environment === "electron"
    ? "traceroute not found — reinstall the application"
    : !hasTraceroute && environment === "local"
    ? "traceroute not installed — available by default on most systems"
    : "Hostname or IP address";

  const handleRun = () => {
    setTarget("SAMPLE.SUBNET.1.0/24");
    // if (!target.trim()) return;
    setIsPaused(false);
    onRun({ target: target.trim(), protocol, maxHops, timeout, probes });
  };

  const handleResume = () => { setIsPaused(false); onResume(); };
  const handleStop = () => { setIsPaused(true); onStop(); };
  const handleReset = () => { setIsPaused(false); onReset(); };

  return (
    <div className="flex flex-col gap-3 p-4 mb-6 bg-card border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-muted-foreground">
          Trace Configuration
        </span>
        {badge && (
          <span className={cn("text-[9px] font-mono tracking-[0.12em] uppercase px-2 py-0.5", badge.cls)}>
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
            "flex-1 px-3 py-2 text-[12px] font-mono outline-none bg-background border border-border text-foreground",
            "placeholder:text-muted-foreground",
            isDisabled && "opacity-50 cursor-not-allowed text-muted-foreground"
          )}
        />

        {/* Protocol selector */}
        <div className="flex items-center overflow-hidden flex-shrink-0">
          {(["ICMP", "UDP", "TCP"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              className={cn(
                "px-3 py-2 text-[11px] font-mono tracking-[0.08em] transition-colors duration-150 border-t border-b border-l border-border",
                protocol === p
                  ? "bg-primary/10 text-primary"
                  : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Run / Stop / Resume */}
        <button
          onClick={isRunning && !isPaused ? handleStop : isPaused ? handleResume : handleRun}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-mono tracking-[0.08em] transition-colors duration-150 flex-shrink-0 border",
            isRunning && !isPaused
              ? "bg-destructive/10 border-destructive/30 text-destructive"
              : "bg-primary/10 border-primary/30 text-primary"
          )}
        >
          {isRunning && !isPaused ? <Square size={12} /> : <Play size={12} />}
          {isRunning && !isPaused ? "Stop" : isPaused ? "Resume" : "Play"}
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          disabled={isRunning && !isPaused}
          className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-mono tracking-[0.08em] transition-colors duration-150 flex-shrink-0 border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Config row */}
      <div className="flex flex-wrap gap-4">
        <ConfigField label="Max Hops" value={maxHops} min={1} max={64} onChange={setMaxHops} />
        <ConfigField label="Timeout (s)" value={timeout} min={1} max={30} onChange={setTimeout} />
        <ConfigField label="Probes / Hop" value={probes} min={1} max={10} onChange={setProbes} />
      </div>
    </div>
  );
}

function ConfigField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono tracking-[0.08em] whitespace-nowrap text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 px-2 py-1 text-[11px] font-mono text-center outline-none bg-background border border-border text-foreground"
      />
    </div>
  );
}
