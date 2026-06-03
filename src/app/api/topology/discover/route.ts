import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { z } from "zod";
import type { ScanEvent, DiscoveredHost, DeviceType } from "@/types/network";
import { checkBinary } from "@/lib/capabilities";
import { MOCK_DATA } from "@/data/mock/host-map";

// Deployment type
const isRemoteDeployment = process.env.VERCEL === "1";

// Zod validation
const cidrSchema = z
  .string()
  .regex(/^(\d{1,3}\.){3}\d{1,3}\/(3[0-2]|[1-2]?\d)$/, "Invalid CIDR notation");

function classifyDevice(vendor: string | null, ip: string): DeviceType {
  const last = parseInt(ip.split(".").pop() ?? "0", 10);
  if (last === 1 || last === 254) return "router";
  if (
    vendor &&
    /cisco|juniper|aruba|ubiquiti|mikrotik|asus|netgear|tp-link|linksys|zyxel|draytek/.test(
      vendor.toLowerCase(),
    )
  )
    return "router";
  return "device";
}

// Parse the buffered stdout from nmap in one batched call
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
        /Nmap scan report for (?:(.+?) \()?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\)?/,
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
        /MAC Address: ([0-9A-F:]{17})(?: \((.+)\))?/i,
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

// Local with binary installation: batched SSE from buffered nmap stdout output
async function localMap(cidr: string, send: (event: ScanEvent) => void) {
  send({
    type: "log",
    level: "success",
    message: "Local deployment detected. nmap installation success.",
  });
  send({
    type: "log",
    level: "info",
    message: `Running: nmap -sn ${cidr}...`,
  });

  const startTime = Date.now();

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
                "nmap failed to start: if nmap is installed please ensure it is in PATH",
              )
            : err,
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
  }
}

// Remote or No binary installation: SSE over mock data, intervaled every 500ms
async function mockMap(send: (event: ScanEvent) => void) {
  const warningMsg: string =
    (isRemoteDeployment
      ? "Remote deployment detected: "
      : "nmap not installed: ") + "Running nmap simulation mode only.";
  const warningInfoMsg: string = isRemoteDeployment
    ? "For full host map access consider using a local deployment instead."
    : "You can install nmap from nmap.org";

  send({
    type: "log",
    level: "warning",
    message: warningMsg,
  });
  send({
    type: "log",
    level: "info",
    message: warningInfoMsg,
  });

  for (const host of MOCK_DATA) {
    // NOTE: setTimeout() returns a numerical ID. Wrap as a promise to wait the full 500ms
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });

    // NOTE: send discovered host object to client record state
    send({
      type: "host_discovered",
      host: host,
    });

    // NOTE: send to scan log for discovery update
    send({
      type: "log",
      level: "success",
      message: `Host up: ${host.ip}${
        host.hostname ? ` (${host.hostname})` : ""
      }${host.vendor ? ` — ${host.vendor}` : ""}`,
    });
  }

  // NOTE: send to scan log for completion update
  send({
    type: "complete",
    hostsFound: MOCK_DATA.length,
    durationMs: MOCK_DATA.length * 500,
  });
}

export async function GET(request: NextRequest) {
  // NOTE: execSync is synchronous. Server thread will be blocked momentarily.
  // Worth noting since we check on every GET request.
  // Consider making checkBinary non-blocking by using exec or Node's fs.access.
  const hasNmap = !isRemoteDeployment ? checkBinary("nmap --version") : false;

  const cidrParam = request.nextUrl.searchParams.get("cidr");
  const parsed = cidrSchema.safeParse(cidrParam);
  if (!parsed.success) {
    return new Response(parsed.error.issues[0]?.message ?? "Invalid CIDR", {
      status: 400,
    });
  }

  const cidr = parsed.data;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ScanEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        } catch {
          // Controller already closed (client disconnected)
        }
      };

      if (!hasNmap) {
        await mockMap(send);
      } else {
        await localMap(cidr, send);
      }

      controller.close();
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
