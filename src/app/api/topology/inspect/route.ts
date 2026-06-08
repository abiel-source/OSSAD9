import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { z } from "zod";
import type { ScanEvent, ArpEntry } from "@/types/network";
import { checkBinary } from "@/lib/capabilities";
import * as readline from "node:readline";
import { MOCK_DATA } from "@/data/mock/arp-inspect";

// Deployment type
const isRemoteDeployment = process.env.VERCEL === "1";

// Zod validation
const cidrSchema = z
  .string()
  .regex(/^(\d{1,3}\.){3}\d{1,3}\/(3[0-2]|[1-2]?\d)$/, "Invalid CIDR notation");

async function mockInspect(send: (entry: ArpEntry) => void) {
  for (const entry of MOCK_DATA) {
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    send(entry);
  }
}

// TODO: arp-scan: Linux binary
async function localArpScan(cidr: string, send: (entry: ArpEntry) => void) {}

// arp -a: Linux/Mac or Windows
async function localArpCache(send: (entry: ArpEntry) => void) {
  try {
    // windows arp -a groups entries by NIC IP and hex code
    let winInterfaceIp: string | null = null; // the interface IP field is supported for windows only
    let winInterfaceHex: string | null = null; // the interface hex code is used in place of _interface for windows only
    await new Promise<void>((resolve, reject) => {
      const proc = spawn("arp", ["-a"], {
        // ignore stdin, pipe stdout and stderr
        stdio: ["ignore", "pipe", "pipe"],
      });

      const rl: readline.Interface = readline.createInterface({
        input: proc.stdout,
      });

      rl.on("line", (line: string) => {
        // TODO: send to scan log
        console.log(`line: ${line}`);

        let ip: string;
        let mac: string;
        let vendor: string | null = null;
        let _interface: string | undefined; // mark as undefined for flagging Windows entry
        let entryType: "static" | "dynamic" | "ifscope" | "permanent" | null =
          null;
        let ttl: number | null = null;
        let conflict:
          | "duplicate-ip"
          | "duplicate-mac"
          | "static-violation"
          | null = null;

        // WINDOWS
        // Interface: 192.168.1.231 --- 0x10
        //   Internet Address      Physical Address      Type
        //   192.168.1.1           3c-37-86-ab-cd-ef     dynamic
        //   192.168.1.50          00-11-22-33-44-55     dynamic
        //   192.168.1.60          88-99-aa-bb-cc-dd     dynamic

        // Interface: 10.0.0.25 --- 0x12
        //   Internet Address      Physical Address      Type
        //   10.0.0.1              00-50-56-c0-00-08     dynamic
        //   10.0.0.20             00-0c-29-12-34-56     dynamic

        const regWinHeader =
          /^\s*Interface:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+---\s+(0x\w{2})\s*$/;
        const regWin =
          /^\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+(\w{2}-\w{2}-\w{2}-\w{2}-\w{2}-\w{2})\s+(dynamic|static)\s*$/;

        // NOTE: it may be possible to use the arp -v verbose to find entryType for linux in a future update
        //
        // LINUX
        // gateway.local (192.168.1.1) at 00:1a:2b:3c:4d:01 [ether] on eth0
        // ? (192.168.1.10) at 00:1a:2b:3c:4d:10 [ether] on eth0
        // ? (192.168.1.20) at <incomplete> on eth0
        const regLinux =
          /^\s*(?:\S+)\s+\((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\)\s+at\s+((?:\w{2}:\w{2}:\w{2}:\w{2}:\w{2}:\w{2})|(?:<incomplete>))\s+(?:(?:\[ether\] on)|(?:on))\s+(\w+)\s*$/;

        // MAC
        // ? (10.0.0.1) at 14:91:82:11:22:33 on en0 ifscope [ethernet]
        // ? (10.0.0.12) at 70:4d:7b:44:55:66 on en0 ifscope [ethernet]
        // ? (10.0.0.25) at 8c:85:90:77:88:99 on en0 ifscope [ethernet]
        // ? (10.0.0.30) at (incomplete) on en0 ifscope [ethernet]
        // ? (224.0.0.251) at 1:0:5e:0:0:fb on en0 permanent [ethernet]
        const regMac =
          /^\s*(?:\S+)\s+\((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\)\s+at\s+((?:\w{1,2}:\w{1,2}:\w{1,2}:\w{1,2}:\w{1,2}:\w{1,2})|(?:\(incomplete\)))\s+on\s+(\w+)\s+(ifscope|permanent)\s+\[ethernet\]\s*$/;

        let match: RegExpMatchArray | null = null;

        if ((match = line.match(regWinHeader))) {
          winInterfaceIp = match[1];
          winInterfaceHex = match[2];
          return;
        } else if ((match = line.match(regWin))) {
          ip = match[1];
          mac = match[2].split("-").join(":");
          entryType = match[3] as ArpEntry["entryType"];
        } else if ((match = line.match(regLinux))) {
          ip = match[1];
          if (match[2] === "<incomplete>") return;
          mac = match[2];
          _interface = match[3];
        } else if ((match = line.match(regMac))) {
          ip = match[1];
          if (match[2] === "(incomplete)") return;
          mac = match[2]
            .split(":")
            .map((hex) => {
              if (hex.length < 2) return "0" + hex;
              return hex;
            })
            .join(":");
          _interface = match[3];
          entryType = match[4] as ArpEntry["entryType"];
        } else {
          // skip malformed or irrelevant line
          return;
        }

        // TODO: Conflict Detection

        // _interface is not assigned during Windows parsing branch- rely on outer-scope header variables instead
        if (
          _interface === undefined &&
          typeof winInterfaceIp === "string" &&
          typeof winInterfaceHex === "string"
        ) {
          // CAUTION: It is theoretically possible that if the k'th header is not parsed but any one of the [1, k-1]'th header is parsed
          // then we assign the wrong NIC IP and Hex Code to the entries of the k'th table. Though this is not likely.
          send({
            ip,
            mac,
            vendor,
            interfaceIp: winInterfaceIp,
            interface: winInterfaceHex,
            entryType,
            ttl,
            conflict,
          });
        } else if (typeof _interface === "string") {
          send({
            ip,
            mac,
            vendor,
            interfaceIp: null,
            interface: _interface,
            entryType,
            ttl,
            conflict,
          });
        } else {
          // No Windows header values were ever parsed at this point - likely a malformed header- skip table
          return;
        }
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        const msg = chunk.toString().trim();
        // TODO: send to scan log
        if (msg) console.log(msg);
      });

      proc.on("error", (err: NodeJS.ErrnoException) => {
        // TODO: send to scan log
        reject(
          // CAUTION: no entity error should never happen in practice after the initial binary check
          err.code === "ENOENT"
            ? new Error(
                "arp -a failed to start: if arp is installed please ensure it is in PATH",
              )
            : err,
        );
      });

      proc.on("close", () => {
        // TODO: send to scan log
        console.log(`arp -a completed`);
        resolve();
      });
    });
  } catch (err) {
    console.log(String(err));
  }
}

export async function GET(request: NextRequest) {
  const hasArpScan = !isRemoteDeployment
    ? checkBinary("arp-scan --version")
    : false;
  const hasArp = !isRemoteDeployment ? checkBinary("arp -a") : false;

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
      const send = (entry: ArpEntry) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(entry)}\n\n`),
          );
        } catch {
          // Controller already closed (client disconnected)
        }
      };

      if (hasArpScan) {
        // await localArpScan(cidr, send);
        await mockInspect(send);
      } else if (hasArp) {
        await localArpCache(send);
      } else {
        await mockInspect(send);
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
