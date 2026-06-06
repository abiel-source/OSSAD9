"use client";

import { useState } from "react";
import { Play, RotateCcw, Loader } from "lucide-react";
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
  onReset: () => void;
}

export default function TraceInputs({
  isRunning,
  onRun,
  onReset,
}: TraceInputsProps) {
  const [target, setTarget] = useState("");
  const [protocol, setProtocol] = useState<TraceConfig["protocol"]>("ICMP");
  const [maxHops, setMaxHops] = useState(30);
  const [timeout, setTimeout] = useState(5);
  const [probes, setProbes] = useState(3);

  const { isRemoteDeployment, hasTraceroute, environment } =
    useCapabilitiesStore();

  const placeholder = isRemoteDeployment
    ? "Trace route is simulated for remote deployments: Enter a dummy subnet"
    : !hasTraceroute && environment === "electron"
      ? "traceroute not found: Trace route is simulated"
      : !hasTraceroute && environment === "local"
        ? "traceroute not installed: Trace route is simulated"
        : "Hostname or IP address";

  const handleRun = () => {
    if (!target.trim()) return;
    onRun({ target: target.trim(), protocol, maxHops, timeout, probes });
  };

  return (
    <div className="flex flex-col gap-3 p-4 mb-5 bg-card border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[11px] uppercase text-muted-foreground">
          Trace Configuration
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

        {/* Protocol selector */}
        <div className="flex items-center overflow-hidden flex-shrink-0">
          {(["ICMP", "UDP", "TCP"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              className={cn(
                "px-3 py-2 text-[12px] transition-colors duration-150 border-t border-b border-l border-border",
                protocol === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {p}
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

      {/* Config row */}
      <div className="flex flex-wrap gap-4">
        <ConfigField
          label="Max Hops"
          value={maxHops}
          min={1}
          max={64}
          onChange={setMaxHops}
        />
        <ConfigField
          label="Timeout (s)"
          value={timeout}
          min={1}
          max={30}
          onChange={setTimeout}
        />
        <ConfigField
          label="Probes / Hop"
          value={probes}
          min={1}
          max={10}
          onChange={setProbes}
        />
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
      <span className="text-[11px] whitespace-nowrap text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 px-2 py-1 text-[12px] font-mono text-center outline-none bg-background border border-border text-foreground"
      />
    </div>
  );
}
