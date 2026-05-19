import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

export type Environment = "vercel" | "electron" | "local";

export interface CapabilitiesResponse {
  environment: Environment;
  hasNmap: boolean;
  hasTraceroute: boolean;
  isRemoteDeployment: boolean;
}

function checkBinary(command: string): boolean {
  try {
    execSync(command, { stdio: "ignore", timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

// 1. Remote deployments like Vercel do not allow executing binaries and do not have nmap or traceroute installed
// 2. Electron deployment should come packaged with binaries - still check for their presence just in case something went wrong with packaging
// 3. Local development do not come packaged with binaries but should be able to execute them if they are installed on the system
export async function GET(req: NextRequest): Promise<NextResponse<CapabilitiesResponse>> {
  const isVercel = process.env.VERCEL === "1";
  const userAgent = req.headers.get("user-agent") ?? "";
  const isElectron = userAgent.includes("Electron");

  let environment: Environment;
  if (isVercel) {
    environment = "vercel";
  } else if (isElectron) {
    environment = "electron";
  } else {
    environment = "local";
  }

  const isRemoteDeployment = environment === "vercel";

  const hasNmap = !isRemoteDeployment
    ? checkBinary("nmap --version")
    : false;

  const hasTraceroute = !isRemoteDeployment
    ? checkBinary("traceroute --version") || checkBinary("tracert /?")
    : false;

  return NextResponse.json({
    environment,
    hasNmap,
    hasTraceroute,
    isRemoteDeployment,
  });
}
