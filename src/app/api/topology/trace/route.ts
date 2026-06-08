import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { z } from "zod";
import type { ScanEvent, Hop } from "@/types/network";
import { checkBinary } from "@/lib/capabilities";
import { MOCK_DATA } from "@/data/mock/route-trace";
import * as readline from "node:readline";

// Deployment type
const isRemoteDeployment = process.env.VERCEL === "1";

// Zod validation
const targetSchema = z.string().min(1).max(253);

// SSE events stream raw Hop objects for now - client consumes into store directly
// ScanEvent integration is implemented next update
async function mockTrace(send: (hop: Hop) => void) {
  for (const hop of MOCK_DATA) {
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    send(hop);
  }
}

// Linux/Mac: traceroute <target>
async function localTraceroute(target: string, send: (hop: Hop) => void) {
  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn("traceroute", [target], {
        // ignore stdin, pipe stdout and stderr
        stdio: ["ignore", "pipe", "pipe"],
      });

      const rl: readline.Interface = readline.createInterface({
        input: proc.stdout,
      });

      // traceroute to dns.google (8.8.8.8), 30 hops max, 60 byte packets
      //  1  gateway.local (192.168.1.1)  1.234 ms  1.456 ms  1.678 ms
      //  2  10.10.0.1 (10.10.0.1)  11.234 ms  12.456 ms  10.678 ms
      //  3  * * *
      //  4  72.14.209.1 (72.14.209.1)  18.234 ms  20.456 ms  19.678 ms
      //  5  dns.google (8.8.8.8)  22.123 ms  21.456 ms  23.789 ms
      rl.on("line", (line: string) => {
        // TODO: send to scan log
        console.log(`line: ${line}`);

        let ttl: number = 0;
        let ip: string | null = null;
        let hostname: string | null = null;
        let asn: string | null = null;
        let rtts: (number | null)[] = [null];

        //  1  gateway.local (192.168.1.1)  1.234 ms  1.456 ms  1.678 ms
        //  2  * * *
        const regAddr =
          /^\s*(\d+)\s+(\S+)\s+\((\d+\.\d+\.\d+\.\d+)\)\s+((?:\d+(?:\.\d+)?\s*ms)|(?:\*))\s+((?:\d+(?:\.\d+)?\s*ms)|(?:\*))\s+((?:\d+(?:\.\d+)?\s*ms)|(?:\*))\s*$/;
        const regNoAddr =
          /^\s*(\d+)\s+((?:\d+(?:\.\d+)?\s*ms)|(?:\*))\s+((?:\d+(?:\.\d+)?\s*ms)|(?:\*))\s+((?:\d+(?:\.\d+)?\s*ms)|(?:\*))\s*$/;

        let match: RegExpMatchArray | null = null;

        if ((match = line.match(regAddr))) {
          ttl = Number(match[1]);
          ip = match[3];
          if (match[3] !== match[2]) hostname = match[2];
          rtts = [match[4], match[5], match[6]].map((rtt) => {
            if (rtt === "*") return null;
            return Number(rtt.slice(0, rtt.length - 2));
          });
        } else if ((match = line.match(regNoAddr))) {
          ttl = Number(match[1]);
          rtts = [match[2], match[3], match[4]].map((rtt) => {
            if (rtt === "*") return null;
            return Number(rtt.slice(0, rtt.length - 2));
          });
        } else {
          // skip malformed line
          return;
        }

        send({
          ttl,
          ip,
          hostname,
          asn,
          rtts,
        });
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        const msg = chunk.toString().trim();
        // TODO: send to scan log
        if (msg) console.log(msg);
      });

      proc.on("error", (err: NodeJS.ErrnoException) => {
        reject(
          err.code === "ENOENT"
            ? new Error(
                "traceroute failed to start: if traceroute is installed please ensure it is in PATH",
              )
            : err,
        );
      });

      proc.on("close", () => {
        // TODO: send to scan log
        console.log("traceroute completed.");
        resolve();
      });
    });
  } catch (err) {
    // TODO: send to scan log
    console.log(String(err));
  }
}

// Windows: tracert <target>
async function localTracert(target: string, send: (hop: Hop) => void) {
  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn("tracert", [target], {
        // ignore stdin, pipe stdout and stderr
        stdio: ["ignore", "pipe", "pipe"],
      });

      const rl: readline.Interface = readline.createInterface({
        input: proc.stdout,
      });

      // Tracing route to dns.google [8.8.8.8]
      // over a maximum of 30 hops:

      //   1     1 ms     2 ms     1 ms  gateway.local [192.168.1.1]
      //   2    11 ms    12 ms    10 ms  10.10.0.1
      //   3     *        *        *     Request timed out.
      //   4    18 ms    20 ms    19 ms  72.14.209.1
      //   5    22 ms    21 ms    23 ms  dns.google [8.8.8.8]

      // Trace complete.

      rl.on("line", (line: string) => {
        // TODO: send to scan log
        console.log(`line: ${line}`);

        let ttl: number = 0;
        let ip: string | null = null;
        let hostname: string | null = null;
        let asn: string | null = null;
        let rtts: (number | null)[] = [null];

        // NOTE: its possible to define a single regex by making the last bracket-wrapped ip as an optional capture group
        // but I prefer to avoid dealing with undefined values- define 3 explicit regex instead for the cases of a given hostname,
        // no hostname, or all rtts are null
        const regAddr =
          /^\s*(\d+)\s+((?:\d+\s*ms)|(?:\*))\s+((?:\d+\s*ms)|(?:\*))\s+((?:\d+\s*ms)|(?:\*))\s+(\S+)\s+\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]\s*$/;
        const regNoAddr =
          /^\s*(\d+)\s+((?:\d+\s*ms)|(?:\*))\s+((?:\d+\s*ms)|(?:\*))\s+((?:\d+\s*ms)|(?:\*))\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s*$/;
        const regTimedOut = /^\s*(\d+)\s+(\*\s+\*\s+\*)\s+Request timed out\.$/;

        let match: RegExpMatchArray | null = null;

        if ((match = line.match(regAddr))) {
          ttl = Number(match[1]);
          ip = match[6];
          hostname = match[5];
          rtts = [match[2], match[3], match[4]].map((rtt) => {
            if (rtt === "*") return null;
            return Number(rtt.slice(0, rtt.length - 2).trim());
          });
        } else if ((match = line.match(regNoAddr))) {
          ttl = Number(match[1]);
          ip = match[5];
          rtts = [match[2], match[3], match[4]].map((rtt) => {
            if (rtt === "*") return null;
            return Number(rtt.slice(0, rtt.length - 2).trim());
          });
        } else if ((match = line.match(regTimedOut))) {
          ttl = Number(match[1]);
          rtts = [null, null, null];
        } else {
          // ignore malformed or irrelevant line
          return;
        }

        send({
          ttl,
          ip,
          hostname,
          asn,
          rtts,
        });
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        const msg = chunk.toString().trim();
        // TODO: send to scan log
        if (msg) console.log(msg);
      });

      proc.on("error", (err: NodeJS.ErrnoException) => {
        reject(
          err.code === "ENOENT"
            ? new Error(
                `tracert ${target} failed to start: if tracert is installed please ensure it is in PATH`,
              )
            : err,
        );
      });

      proc.on("close", () => {
        // TODO: send to scan log
        console.log(`tracert ${target} completed`);
        resolve();
      });
    });
  } catch (err) {
    console.log(String(err));
  }
}

export async function GET(request: NextRequest) {
  const hasTraceroute = !isRemoteDeployment
    ? checkBinary("traceroute --version")
    : false;

  const hasTracert = !isRemoteDeployment ? checkBinary("tracert /?") : false;

  const targetParam = request.nextUrl.searchParams.get("target");
  const parsed = targetSchema.safeParse(targetParam);
  if (!parsed.success) {
    return new Response(
      parsed.error.issues[0]?.message ?? "Invalid Target IP",
      {
        status: 400,
      },
    );
  }

  const target = parsed.data;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (hop: Hop) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(hop)}\n\n`),
          );
        } catch {
          // Controller already closed (client disconnected)
        }
      };

      if (hasTraceroute) {
        await localTraceroute(target, send);
      } else if (hasTracert) {
        await localTracert(target, send);
      } else {
        await mockTrace(send);
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
