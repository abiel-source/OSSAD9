"use client";

import { useState, useEffect } from "react";
import ToolHeader from "@/components/ui/ToolHeader";
import { Clock } from "lucide-react";

type TabId = "live" | "convert" | "uptime";

const TABS: { id: TabId; label: string }[] = [
  { id: "live",    label: "Live Clock" },
  { id: "convert", label: "Convert" },
  { id: "uptime",  label: "Uptime Calc" },
];

const TIMEZONES = [
  { label: "UTC",       tz: "UTC" },
  { label: "New York",  tz: "America/New_York" },
  { label: "London",    tz: "Europe/London" },
  { label: "Paris",     tz: "Europe/Paris" },
  { label: "Dubai",     tz: "Asia/Dubai" },
  { label: "Singapore", tz: "Asia/Singapore" },
  { label: "Tokyo",     tz: "Asia/Tokyo" },
  { label: "Sydney",    tz: "Australia/Sydney" },
];

function fmtTZ(date: Date, tz: string): string {
  return date.toLocaleString("en-GB", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
}

function fmtUptimeTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "—";
  if (seconds < 0.001) return `${(seconds * 1_000_000).toFixed(2)} µs`;
  if (seconds < 1)     return `${(seconds * 1000).toFixed(2)} ms`;
  if (seconds < 60)    return `${seconds.toFixed(2)} s`;
  if (seconds < 3600)  return `${(seconds / 60).toFixed(2)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hr`;
  if (seconds < 86400 * 30) return `${(seconds / 86400).toFixed(2)} days`;
  return `${(seconds / (86400 * 30.44)).toFixed(2)} months`;
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

export default function TimestampPage() {
  const [tab, setTab] = useState<TabId>("live");
  const [now, setNow] = useState(() => new Date());

  // Convert tab
  const [unixInput, setUnixInput]     = useState("");
  const [dateInput, setDateInput]     = useState("");
  const [unixResult, setUnixResult]   = useState<string | null>(null);
  const [dateResult, setDateResult]   = useState<string | null>(null);
  const [unixError, setUnixError]     = useState(false);
  const [dateError, setDateError]     = useState(false);

  // Uptime tab
  const [startInput, setStartInput]   = useState("");
  const [endInput, setEndInput]       = useState("");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleUnixConvert = () => {
    const n = parseInt(unixInput.trim(), 10);
    if (isNaN(n)) { setUnixError(true); setUnixResult(null); return; }
    setUnixError(false);
    // Handle both seconds and milliseconds heuristically
    const ms = unixInput.trim().length >= 13 ? n : n * 1000;
    setUnixResult(new Date(ms).toUTCString());
  };

  const handleDateConvert = () => {
    const d = new Date(dateInput.trim());
    if (isNaN(d.getTime())) { setDateError(true); setDateResult(null); return; }
    setDateError(false);
    setDateResult(Math.floor(d.getTime() / 1000).toString());
  };

  // Uptime calculation
  const startDate  = startInput  ? new Date(startInput)  : null;
  const endDate    = endInput    ? new Date(endInput)    : null;
  const uptimeMs   = startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())
    ? Math.max(0, endDate.getTime() - startDate.getTime())
    : null;
  const uptimeSec  = uptimeMs !== null ? uptimeMs / 1000 : null;

  function fmtDuration(seconds: number): string {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(" ");
  }

  return (
    <div>
      <ToolHeader
        title="Timestamp & Uptime"
        description="Live Unix clock, timestamp conversion, timezone display, SLA reference, and uptime calculator."
        icon={Clock}
      />

      {/* Tab bar */}
      <div className="flex mb-5 border border-border overflow-hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[12px] tracking-[0.08em] transition-colors duration-150 border-r border-border last:border-r-0 ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Live Clock ── */}
      {tab === "live" && (
        <div className="flex flex-col gap-5">
          {/* Big Unix counter */}
          <div className="flex flex-col p-4 gap-2 bg-card border border-border">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              Unix Timestamp (seconds)
            </span>
            <span className="text-4xl font-mono font-bold text-foreground tabular-nums">
              {Math.floor(now.getTime() / 1000)}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              ms: {now.getTime()}
            </span>
          </div>

          {/* Timezone grid */}
          <div className="border border-border bg-card overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  {["Timezone", "Local Time"].map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-medium text-muted-foreground"
                      style={{ fontSize: "10px" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {TIMEZONES.map((row) => (
                  <tr key={row.tz} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 text-muted-foreground w-28">{row.label}</td>
                    <td className="px-3 py-2 text-foreground tabular-nums">{fmtTZ(now, row.tz)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SLA downtime reference */}
          <div className="border border-border bg-card overflow-hidden">
            <div className="px-3 py-2 border-b border-border">
              <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
                SLA Downtime Reference
              </span>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  {["SLA", "Per year", "Per month", "Per week", "Per day"].map((col) => (
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
                  const df = 1 - row.uptime;
                  return (
                    <tr key={row.label} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2 text-foreground">{row.label}</td>
                      <td className="px-3 py-2 text-muted-foreground">{fmtUptimeTime(df * 365.25 * 86400)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{fmtUptimeTime(df * 30.44  * 86400)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{fmtUptimeTime(df * 7      * 86400)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{fmtUptimeTime(df * 86400)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Convert ── */}
      {tab === "convert" && (
        <div className="flex flex-col gap-5">

          {/* Unix → Human */}
          <div className="flex flex-col p-4 gap-3 bg-card border border-border">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              Unix → Human Readable
            </span>
            <div className="flex gap-3">
              <input
                type="text"
                value={unixInput}
                onChange={(e) => { setUnixInput(e.target.value); setUnixError(false); setUnixResult(null); }}
                placeholder="e.g. 1716307200 or 1716307200000"
                className="flex-1 px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={handleUnixConvert}
                className="px-4 py-2 text-[12px] bg-primary text-primary-foreground border border-primary whitespace-nowrap"
              >
                Convert →
              </button>
            </div>
            {unixError && (
              <span className="text-[11px] text-destructive">Invalid timestamp — enter an integer (seconds or milliseconds)</span>
            )}
            {unixResult && (
              <div className="px-3 py-2 border border-border bg-background font-mono text-[13px] text-foreground">
                {unixResult}
              </div>
            )}
          </div>

          {/* Human → Unix */}
          <div className="flex flex-col p-4 gap-3 bg-card border border-border">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              Human Readable → Unix
            </span>
            <div className="flex gap-3">
              <input
                type="text"
                value={dateInput}
                onChange={(e) => { setDateInput(e.target.value); setDateError(false); setDateResult(null); }}
                placeholder="e.g. 2024-05-21T12:00:00Z or May 21 2024"
                className="flex-1 px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={handleDateConvert}
                className="px-4 py-2 text-[12px] bg-primary text-primary-foreground border border-primary whitespace-nowrap"
              >
                Convert →
              </button>
            </div>
            {dateError && (
              <span className="text-[11px] text-destructive">Could not parse date — try ISO 8601 format: 2024-05-21T12:00:00Z</span>
            )}
            {dateResult && (
              <div className="px-3 py-2 border border-border bg-background font-mono text-[13px] text-foreground">
                {dateResult}
              </div>
            )}
          </div>

          {/* Quick reference */}
          <div className="flex flex-col p-4 gap-2 bg-card border border-border">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              Current timestamps (live)
            </span>
            <table className="w-full text-[13px]">
              <tbody className="font-mono">
                {[
                  { label: "Unix (s)",      value: Math.floor(now.getTime() / 1000).toString() },
                  { label: "Unix (ms)",     value: now.getTime().toString() },
                  { label: "ISO 8601",      value: now.toISOString() },
                  { label: "RFC 2822",      value: now.toUTCString() },
                  { label: "Day of week",   value: now.toLocaleString("en-US", { weekday: "long", timeZone: "UTC" }) },
                  { label: "Day of year",   value: (() => { const s = new Date(Date.UTC(now.getUTCFullYear(), 0, 0)); return String(Math.floor((now.getTime() - s.getTime()) / 86400000)); })() },
                  { label: "Week number",   value: (() => { const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); return String(Math.ceil((((d.getTime() - y.getTime()) / 86400000) + 1) / 7)); })() },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 text-muted-foreground w-32">{row.label}</td>
                    <td className="px-3 py-2 text-foreground tabular-nums">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Uptime Calc ── */}
      {tab === "uptime" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col p-4 gap-3 bg-card border border-border">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              Uptime Calculator
            </span>
            <p className="text-[11px] text-muted-foreground">
              Enter a start and end time to calculate total uptime duration and SLA percentage.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-[11px] text-muted-foreground">Start time</span>
                <input
                  type="datetime-local"
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  className="px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-[11px] text-muted-foreground">End time</span>
                <input
                  type="datetime-local"
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  className="px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground"
                />
              </div>
            </div>
          </div>

          {uptimeSec !== null && (
            <div className="flex flex-col gap-4">
              <div className="border border-border bg-card overflow-hidden">
                <table className="w-full text-[13px]">
                  <tbody className="font-mono">
                    {[
                      { label: "Duration",         value: fmtDuration(uptimeSec) },
                      { label: "Total seconds",     value: uptimeSec.toLocaleString() },
                      { label: "Total minutes",     value: (uptimeSec / 60).toFixed(2) },
                      { label: "Total hours",       value: (uptimeSec / 3600).toFixed(4) },
                      { label: "Total days",        value: (uptimeSec / 86400).toFixed(4) },
                    ].map((row) => (
                      <tr key={row.label} className="border-b border-border last:border-b-0">
                        <td className="px-3 py-2 text-muted-foreground w-40">{row.label}</td>
                        <td className="px-3 py-2 text-foreground">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SLA against common window sizes */}
              <div className="border border-border bg-card overflow-hidden">
                <div className="px-3 py-2 border-b border-border">
                  <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
                    SLA equivalent (uptime as % of window)
                  </span>
                </div>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border">
                      {["Window", "Uptime %"].map((col) => (
                        <th
                          key={col}
                          className="px-3 py-2 text-left font-medium text-muted-foreground"
                          style={{ fontSize: "10px" }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {[
                      { label: "Per day",   window: 86400 },
                      { label: "Per week",  window: 86400 * 7 },
                      { label: "Per month", window: 86400 * 30.44 },
                      { label: "Per year",  window: 86400 * 365.25 },
                    ].map((row) => {
                      const pct = Math.min(100, (uptimeSec / row.window) * 100);
                      return (
                        <tr key={row.label} className="border-b border-border last:border-b-0">
                          <td className="px-3 py-2 text-muted-foreground">{row.label}</td>
                          <td className="px-3 py-2 text-foreground">{pct.toFixed(4)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!uptimeSec && (
            <div className="px-3 py-10 text-center text-[12px] text-muted-foreground border border-border bg-card">
              Enter a start and end time above to calculate uptime
            </div>
          )}
        </div>
      )}

      {/* Examples */}
      <div className="mt-5 flex flex-col p-4 gap-3 bg-card border border-border">
        <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">Examples</span>
        <div className="flex flex-wrap gap-2">
          {[
            {
              label: "Unix → Date — Unix epoch",
              action: () => { setTab("convert"); setUnixInput("0"); setUnixResult(null); setUnixError(false); },
            },
            {
              label: "Unix → Date — Y2K",
              action: () => { setTab("convert"); setUnixInput("946684800"); setUnixResult(null); setUnixError(false); },
            },
            {
              label: "Unix → Date — milliseconds",
              action: () => { setTab("convert"); setUnixInput("1716307200000"); setUnixResult(null); setUnixError(false); },
            },
            {
              label: "Date → Unix — ISO 8601",
              action: () => { setTab("convert"); setDateInput("2024-05-21T12:00:00Z"); setDateResult(null); setDateError(false); },
            },
            {
              label: "Date → Unix — natural",
              action: () => { setTab("convert"); setDateInput("January 1 2000 00:00:00 UTC"); setDateResult(null); setDateError(false); },
            },
            {
              label: "Uptime — 30-day window",
              action: () => {
                setTab("uptime");
                setStartInput("2024-04-01T00:00");
                setEndInput("2024-05-01T00:00");
              },
            },
            {
              label: "Uptime — 1 year",
              action: () => {
                setTab("uptime");
                setStartInput("2024-01-01T00:00");
                setEndInput("2025-01-01T00:00");
              },
            },
          ].map((ex) => (
            <button
              key={ex.label}
              onClick={ex.action}
              className="px-3 py-1.5 text-[12px] font-mono border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
