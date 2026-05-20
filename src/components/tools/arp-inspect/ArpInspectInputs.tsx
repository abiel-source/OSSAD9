"use client";

import { useState } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { useArpStore } from "@/store/arp";
import { useCapabilitiesStore } from "@/store/capabilities";

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
  const [_interface, setInterface] =
    useState<ArpInspectConfig["interface"]>("ETH0");
  const [timeout, setTimeout] = useState(5);

  const { isPaused, setIsPaused } = useArpStore();
  const { isRemoteDeployment } = useCapabilitiesStore();

  const handleRun = () => {
    // TEMPORARILY ADD THIS FOR MOCK DATA TESTING
    setTarget("SAMPLE.SUBNET.1.0/24");

    // if (!target.trim()) return;

    setIsPaused(false);

    onRun({
      target: target.trim(),
      interface: _interface,
      timeout: timeout,
    });
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
        backgroundColor: "var(--ossad-bg-surface)",
        border: "1px solid var(--ossad-border)",
      }}
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className="text-[10px] font-mono tracking-[0.16em] uppercase"
          style={{ color: "var(--ossad-text-secondary)" }}
        >
          ARP CONFIGURATION
        </span>
        {isRemoteDeployment && (
          <span
            className="text-[9px] font-mono tracking-[0.12em] uppercase px-2 py-0.5 rounded-[3px]"
            style={{
              backgroundColor: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "var(--ossad-cautious)",
            }}
          >
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
          className="flex-1 px-3 py-2 rounded-[3px] text-[12px] font-mono outline-none"
          style={{
            border: "1px solid var(--ossad-border)",
            backgroundColor: "var(--ossad-bg-elevated)",
            color: isRemoteDeployment ? "var(--ossad-text-secondary)" : "var(--ossad-text-primary)",
            cursor: isRemoteDeployment ? "not-allowed" : "text",
            opacity: isRemoteDeployment ? 0.5 : 1,
          }}
        />

        {/* Interface selector */}
        <div
          className="flex items-center rounded-[3px] overflow-hidden flex-shrink-0"
          style={{
            borderRight: "1px solid var(--ossad-border)",
          }}
        >
          {(["ETH0", "EN0"] as const).map((i, idx) => (
            <button
              key={i}
              onClick={() => setInterface(i)}
              className="px-3 py-2 text-[11px] font-mono tracking-[0.08em] transition-colors duration-150"
              style={{
                borderTop: "1px solid var(--ossad-border)",
                borderBottom: "1px solid var(--ossad-border)",
                borderLeft: "1px solid var(--ossad-border)",

                borderTopLeftRadius: idx === 0 ? "3px" : "0px",
                borderBottomLeftRadius: idx === 0 ? "3px" : "0px",

                backgroundColor:
                  _interface === i
                    ? "rgba(54,123,240,0.12)"
                    : "var(--ossad-bg-elevated)",
                color:
                  _interface === i
                    ? "var(--ossad-accent)"
                    : "var(--ossad-text-secondary)",
              }}
            >
              {i}
            </button>
          ))}
        </div>

        {/* Run / Stop / Resume */}
        <button
          onClick={
            isRunning && !isPaused
              ? handleStop
              : isPaused
              ? handleResume
              : handleRun
          }
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-[3px] text-[11px] font-mono tracking-[0.0em] transition-colors duration-150 flex-shrink-0"
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
