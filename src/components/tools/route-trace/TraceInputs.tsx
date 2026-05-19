"use client";

import { useState } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { useRouteTraceStore } from "@/store/routetrace";
import { useCapabilitiesStore } from "@/store/capabilities";

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

  // Disabled when remote OR when traceroute is not installed locally
  const isDisabled = isRemoteDeployment || !hasTraceroute;

  // Badge shown in header
  const badge = isRemoteDeployment
    ? { label: "Simulation Mode", color: "var(--ossad-cautious)", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" }
    : !hasTraceroute
    ? { label: "traceroute not found", color: "var(--ossad-catastrophic)", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" }
    : null;

  // Placeholder text
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

  const handleResume = () => {
    setIsPaused(false);
    onResume();
  };

  const handleStop = () => {
    setIsPaused(true);
    onStop();
  };

  const handleReset = () => {
    setIsPaused(false);
    onReset();
  };

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-[3px] mb-6"
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
          TRACE CONFIGURATION
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

      {/* Main row: target + protocol + run */}
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

        {/* Protocol selector */}
        <div
          className="flex items-center rounded-[3px] overflow-hidden flex-shrink-0"
          style={{
            borderRight: "1px solid var(--ossad-border)",
          }}
        >
          {(["ICMP", "UDP", "TCP"] as const).map((p, idx) => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              className="px-3 py-2 text-[11px] font-mono tracking-[0.08em] transition-colors duration-150"
              style={{
                backgroundColor:
                  protocol === p
                    ? "rgba(54,123,240,0.12)"
                    : "var(--ossad-bg-elevated)",
                color:
                  protocol === p
                    ? "var(--ossad-accent)"
                    : "var(--ossad-text-secondary)",

                borderLeft: "1px solid var(--ossad-border)",
                borderBottom: "1px solid var(--ossad-border)",
                borderTop: "1px solid var(--ossad-border)",

                borderTopLeftRadius: idx === 0 ? "3px" : "0px",
                borderBottomLeftRadius: idx === 0 ? "3px" : "0px",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Run / Stop */}
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

      {/* Config row: secondary options */}
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
      <span
        className="text-[10px] font-mono tracking-[0.08em] whitespace-nowrap"
        style={{ color: "var(--ossad-text-secondary)" }}
      >
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 px-2 py-1 rounded-[3px] text-[11px] font-mono text-center outline-none"
        style={{
          backgroundColor: "var(--ossad-bg-elevated)",
          border: "1px solid var(--ossad-border)",
          color: "var(--ossad-text-primary)",
        }}
      />
    </div>
  );
}
