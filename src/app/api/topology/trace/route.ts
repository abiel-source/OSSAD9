import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { z } from "zod";
import type { ScanEvent, Hop } from "@/types/network";
import { checkBinary } from "@/lib/capabilities";
import { MOCK_DATA } from "@/data/mock/route-trace";

// Deployment type
const isRemoteDeployment = process.env.VERCEL === "1";

// Zod validation
const targetSchema = z.string().min(1).max(253);

// SSE events stream raw Hop objects for now - client consumes into store directly
// ScanEvent integration is implemented next update
async function mockTrace(send: (hop: Hop) => void) {}

export async function GET(request: NextRequest) {
  const hasTraceRoute = !isRemoteDeployment
    ? checkBinary("tracert") // Windows
    : false;

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

      if (!hasTraceRoute) {
        await mockTrace(send);
      }
      //   else {
      //     await localTrace(target, send);
      //   }

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
