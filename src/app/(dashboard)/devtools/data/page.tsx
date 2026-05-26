"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import { BarChart2 } from "lucide-react";

const DATA_UNITS = ["bits", "bytes", "KB", "MB", "GB", "TB", "PB"] as const;
type DataUnit = typeof DATA_UNITS[number];
const DATA_TO_BITS: Record<DataUnit, number> = {
  bits:  1,
  bytes: 8,
  KB:    8 * 1024,
  MB:    8 * 1024 ** 2,
  GB:    8 * 1024 ** 3,
  TB:    8 * 1024 ** 4,
  PB:    8 * 1024 ** 5,
};

const SPEED_UNITS = ["bps", "Kbps", "Mbps", "Gbps"] as const;
type SpeedUnit = typeof SPEED_UNITS[number];
const SPEED_TO_BPS: Record<SpeedUnit, number> = {
  bps:  1,
  Kbps: 1_000,
  Mbps: 1_000_000,
  Gbps: 1_000_000_000,
};

function fmtBytes(bits: number, unit: DataUnit): string {
  const val = bits / DATA_TO_BITS[unit];
  return val >= 1e12
    ? (val / 1e12).toFixed(4)
    : val >= 1e9
    ? (val / 1e9).toFixed(4)
    : val >= 1e6
    ? (val / 1e6).toFixed(6)
    : val.toFixed(6);
}

function fmtTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "—";
  if (seconds < 0.001) return `${(seconds * 1_000_000).toFixed(2)} µs`;
  if (seconds < 1)     return `${(seconds * 1000).toFixed(2)} ms`;
  if (seconds < 60)    return `${seconds.toFixed(2)} s`;
  if (seconds < 3600)  return `${(seconds / 60).toFixed(2)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hr`;
  return `${(seconds / 86400).toFixed(2)} days`;
}

const SLA_ROWS = [
  { label: "90%",     uptime: 0.90 },
  { label: "95%",     uptime: 0.95 },
  { label: "99%",     uptime: 0.99 },
  { label: "99.9%",   uptime: 0.999 },
  { label: "99.95%",  uptime: 0.9995 },
  { label: "99.99%",  uptime: 0.9999 },
  { label: "99.999%", uptime: 0.99999 },
];

export default function DataBandwidthPage() {
  const [dataValue, setDataValue] = useState("");
  const [dataUnit, setDataUnit]   = useState<DataUnit>("MB");
  const [speedValue, setSpeedValue] = useState("");
  const [speedUnit, setSpeedUnit]   = useState<SpeedUnit>("Mbps");

  const rawData  = parseFloat(dataValue);
  const rawSpeed = parseFloat(speedValue);
  const dataBits = isNaN(rawData)  ? NaN : rawData  * DATA_TO_BITS[dataUnit];
  const speedBps = isNaN(rawSpeed) ? NaN : rawSpeed * SPEED_TO_BPS[speedUnit];
  const transferSec = dataBits / speedBps;

  const conversions: { unit: string; value: string }[] =
    !isNaN(dataBits) && dataValue !== ""
      ? DATA_UNITS.map((u) => ({ unit: u, value: `${fmtBytes(dataBits, u)} ${u}` }))
      : [];

  return (
    <div className="flex flex-col gap-5">
      <ToolHeader
        title="Data & Bandwidth"
        description="Unit conversion, transfer time estimation, and SLA uptime reference."
        icon={BarChart2}
      />

      <div className="flex flex-col lg:flex-row gap-5">

        {/* Left column */}
        <div className="flex flex-col gap-5 flex-1">

          {/* Data converter */}
          <div className="flex flex-col p-4 gap-3 bg-card border border-border">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              Data Size Converter
            </span>
            <div className="flex gap-3">
              <input
                type="number"
                value={dataValue}
                onChange={(e) => setDataValue(e.target.value)}
                placeholder="0"
                className="flex-1 px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground placeholder:text-muted-foreground"
              />
              <select
                value={dataUnit}
                onChange={(e) => setDataUnit(e.target.value as DataUnit)}
                className="px-3 py-2 text-[12px] font-mono outline-none bg-background border border-border text-foreground"
              >
                {DATA_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="border border-border overflow-hidden">
              <table className="w-full text-[13px]">
                <tbody className="font-mono">
                  {conversions.length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-center text-[12px] text-muted-foreground">
                        Enter a value above
                      </td>
                    </tr>
                  ) : (
                    conversions.map((row) => (
                      <tr key={row.unit} className="border-b border-border">
                        <td className="px-3 py-2 text-muted-foreground w-16">{row.unit}</td>
                        <td className="px-3 py-2 text-foreground">{row.value}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transfer time */}
          <div className="flex flex-col p-4 gap-3 bg-card border border-border">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              Transfer Time Estimator
            </span>
            <p className="text-[11px] text-muted-foreground">
              Uses the data size above and the link speed below.
            </p>
            <div className="flex gap-3">
              <input
                type="number"
                value={speedValue}
                onChange={(e) => setSpeedValue(e.target.value)}
                placeholder="Link speed"
                className="flex-1 px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground placeholder:text-muted-foreground"
              />
              <select
                value={speedUnit}
                onChange={(e) => setSpeedUnit(e.target.value as SpeedUnit)}
                className="px-3 py-2 text-[12px] font-mono outline-none bg-background border border-border text-foreground"
              >
                {SPEED_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border border-border bg-background">
              <span className="text-[12px] font-mono text-muted-foreground">Estimated transfer time</span>
              <span className="text-[14px] font-mono text-foreground">
                {dataValue && speedValue ? fmtTime(transferSec) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Right column: SLA table */}
        <div className="flex flex-col p-4 gap-3 bg-card border border-border lg:w-[420px]">
          <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
            SLA Uptime Reference
          </span>
          <div className="border border-border overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  {["SLA", "Per year", "Per month", "Per week"].map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap"
                      style={{ fontSize: "10px" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {SLA_ROWS.map((row) => {
                  const downFrac = 1 - row.uptime;
                  return (
                    <tr key={row.label} className="border-b border-border">
                      <td className="px-3 py-2 text-foreground">{row.label}</td>
                      <td className="px-3 py-2 text-muted-foreground">{fmtTime(downFrac * 365.25 * 86400)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{fmtTime(downFrac * 30.44  * 86400)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{fmtTime(downFrac * 7      * 86400)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Examples */}
      <div className="flex flex-col p-4 gap-3 bg-card border border-border">
        <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">Examples</span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "4K movie",      dv: "50",    du: "GB" as DataUnit,  sv: "100",  su: "Mbps" as SpeedUnit },
            { label: "Blu-ray disc",  dv: "25",    du: "GB" as DataUnit,  sv: "1",    su: "Gbps" as SpeedUnit },
            { label: "OS backup",     dv: "500",   du: "MB" as DataUnit,  sv: "10",   su: "Mbps" as SpeedUnit },
            { label: "1 TB archive",  dv: "1",     du: "TB" as DataUnit,  sv: "1",    su: "Gbps" as SpeedUnit },
            { label: "Email (5 MB)",  dv: "5",     du: "MB" as DataUnit,  sv: "10",   su: "Mbps" as SpeedUnit },
          ].map((ex) => (
            <button
              key={ex.label}
              onClick={() => {
                setDataValue(ex.dv);
                setDataUnit(ex.du);
                setSpeedValue(ex.sv);
                setSpeedUnit(ex.su);
              }}
              className="px-3 py-1.5 text-left text-[12px] font-mono border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span className="text-foreground">{ex.label}</span>
              <span className="ml-2 text-[11px] hidden sm:inline">— {ex.dv} {ex.du} @ {ex.sv} {ex.su}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
