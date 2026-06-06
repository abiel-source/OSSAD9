import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { z } from "zod";
import type { ScanEvent, ArpEntry } from "@/types/network";
import { checkBinary } from "@/lib/capabilities";
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
        // await localArpCache(cidr, send);
        await mockInspect(send);
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
