import { execSync } from "child_process";

export function checkBinary(command: string): boolean {
  try {
    execSync(command, { stdio: "ignore", timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
