// Types are Firebase/Firestore compatible:
// (All IDs are strings)
// (No undefined values - null instead)

export type DeviceType = "router" | "device";

export interface DiscoveredHost {
  id: string; // IP address (Firestore document ID)
  ip: string;
  hostname: string | null;
  mac: string | null;
  vendor: string | null;
  latencyMs: number | null;
  deviceType: DeviceType;
}

export interface Hop {
  ttl: number;
  ip: string | null; // null = timeout (* * *)
  hostname: string | null;
  asn: string | null;
  rtts: (number | null)[]; // one per probe, null = timeout
}

export interface ArpEntry {
  ip: string;
  mac: string;
  vendor: string | null;
  interface: "ETH0" | "EN0";
  entryType: "static" | "dynamic";
  ttl: number | null;
  conflict: "duplicate-ip" | "duplicate-mac" | "static-violation" | null;
}

export type LogLevel = "info" | "success" | "warning" | "error";

export interface ScanLogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
}

// SSE events (server --> client)
export type ScanEvent =
  | { type: "host_discovered"; host: DiscoveredHost }
  | { type: "log"; level: LogLevel; message: string }
  | { type: "complete"; hostsFound: number; durationMs: number }
  | { type: "error"; message: string };

// Pool stores together into 1 catalogue
// combination of unique fields from DiscoveredHost, Hop & ArpEntry
// combine duplicate IP from cross-data into 1 InventoryItem
// ip/mac conflict/collision status only carries over from Arp
export interface InventoryItem {
  ip: string; // all 3
  hostname: string | null; // host map + route trace
  mac: string | null; // host map + arp
  vendor: string | null; // host map + arp
  deviceType: DeviceType | null; // host map only
  latencyMs: number | null; // host map only
  asn: string | null; // route trace only
  rtts: (number | null)[] | null; // route trace only
  entryType: "static" | "dynamic" | null; // arp only
  conflict: ArpEntry["conflict"]; // arp only
  sources: ("hostmap" | "routetrace" | "arp")[];
}
