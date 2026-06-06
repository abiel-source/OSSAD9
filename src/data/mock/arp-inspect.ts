import { ArpEntry } from "@/types/network";

export const MOCK_DATA: ArpEntry[] = [
  {
    ip: "10.0.1.1",
    mac: "00:1a:2b:3c:4d:01",
    vendor: "Cisco Systems",
    interface: "ETH0",
    entryType: "static",
    ttl: null,
    conflict: null,
  },
  {
    ip: "10.0.1.10",
    mac: "00:1a:2b:3c:4d:10",
    vendor: "Dell Inc.",
    interface: "EN0",
    entryType: "dynamic",
    ttl: 180,
    conflict: null,
  },
  {
    ip: "10.0.1.20",
    mac: "00:1a:2b:3c:4d:20",
    vendor: "Apple Inc.",
    interface: "ETH0",
    entryType: "dynamic",
    ttl: 120,
    conflict: "duplicate-ip",
  },
  {
    ip: "10.0.1.30",
    mac: "00:1a:2b:3c:4d:20",
    vendor: null,
    interface: "ETH0",
    entryType: "dynamic",
    ttl: 60,
    conflict: "duplicate-mac",
  },
  {
    ip: "10.0.1.1",
    mac: "00:1a:2b:3c:4d:50",
    vendor: "Samsung Electronics",
    interface: "EN0",
    entryType: "dynamic",
    ttl: 90,
    conflict: "static-violation",
  },
];
