import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { z } from "zod";
import type { ScanEvent, DiscoveredHost, DeviceType } from "@/types/network";

// ZOD VALIDATION
const cidrSchema = z
  .string()
  .regex(/^(\d{1,3}\.){3}\d{1,3}\/(3[0-2]|[1-2]?\d)$/, "Invalid CIDR notation");

function classifyDevice(vendor: string | null, ip: string): DeviceType {
  const last = parseInt(ip.split(".").pop() ?? "0", 10);
  if (last === 1 || last === 254) return "router";
  if (
    vendor &&
    /cisco|juniper|aruba|ubiquiti|mikrotik|asus|netgear|tp-link|linksys|zyxel|draytek/.test(
      vendor.toLowerCase()
    )
  )
    return "router";
  return "device";
}

function parseNmapOutput(raw: string): DiscoveredHost[] {
  const hosts: DiscoveredHost[] = [];

  // Split on host boundaries — each block starts with "Nmap scan report for"
  const blocks = raw.split(/\n(?=Nmap scan report for)/);

  for (const block of blocks) {
    if (!block.includes("Nmap scan report for")) continue;

    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let ip: string | null = null;
    let hostname: string | null = null;
    let latencyMs: number | null = null;
    let mac: string | null = null;
    let vendor: string | null = null;

    for (const line of lines) {
      // "Nmap scan report for hostname (192.168.1.1)"
      // "Nmap scan report for 192.168.1.1"
      const reportMatch = line.match(
        /Nmap scan report for (?:(.+?) \()?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\)?/
      );
      if (reportMatch) {
        hostname = reportMatch[1]?.trim() ?? null;
        ip = reportMatch[2];
        continue;
      }

      // "Host is up (0.0042s latency)."
      const latMatch = line.match(/Host is up \((\d+\.?\d*)s latency\)/);
      if (latMatch) {
        latencyMs = parseFloat(latMatch[1]) * 1000;
        continue;
      }

      // "MAC Address: AA:BB:CC:DD:EE:FF (Vendor Name)"
      const macMatch = line.match(
        /MAC Address: ([0-9A-F:]{17})(?: \((.+)\))?/i
      );
      if (macMatch) {
        mac = macMatch[1];
        vendor = macMatch[2] ?? null;
        continue;
      }
    }

    if (!ip) continue;

    hosts.push({
      id: ip,
      ip,
      hostname,
      mac,
      vendor,
      latencyMs,
      deviceType: classifyDevice(vendor, ip),
    });
  }

  return hosts;
}

export async function GET(request: NextRequest) {
  const cidrParam = request.nextUrl.searchParams.get("cidr");
  const parsed = cidrSchema.safeParse(cidrParam);

  if (!parsed.success) {
    return new Response(parsed.error.issues[0]?.message ?? "Invalid CIDR", {
      status: 400,
    });
  }

  const cidr = parsed.data;
  const encoder = new TextEncoder();
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ScanEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Controller already closed (client disconnected)
        }
      };

      send({
        type: "log",
        level: "info",
        message: `Running: nmap -sn ${cidr}`,
      });

      try {
        await new Promise<void>((resolve, reject) => {
          const proc = spawn("nmap", ["-sn", cidr], {
            stdio: ["ignore", "pipe", "pipe"],
          });

          let stdout = "";

          proc.stdout.on("data", (chunk: Buffer) => {
            stdout += chunk.toString();
          });

          proc.stderr.on("data", (chunk: Buffer) => {
            const msg = chunk.toString().trim();
            if (msg) send({ type: "log", level: "warning", message: msg });
          });

          proc.on("error", (err: NodeJS.ErrnoException) => {
            reject(
              err.code === "ENOENT"
                ? new Error(
                    "nmap not found — install nmap and ensure it is in PATH"
                  )
                : err
            );
          });

          proc.on("close", () => {
            const hosts = parseNmapOutput(stdout);

            for (const host of hosts) {
              send({ type: "host_discovered", host });
              send({
                type: "log",
                level: "success",
                message: `Host up: ${host.ip}${
                  host.hostname ? ` (${host.hostname})` : ""
                }${host.vendor ? ` — ${host.vendor}` : ""}`,
              });
            }

            send({
              type: "complete",
              hostsFound: hosts.length,
              durationMs: Date.now() - startTime,
            });

            resolve();
          });
        });
      } catch (err) {
        send({ type: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx proxy buffering
    },
  });
}
