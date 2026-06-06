import { Hop } from "@/types/network";

export const MOCK_DATA: Hop[] = [
  {
    ttl: 1,
    ip: "10.0.1.1",
    hostname: "gateway.local",
    asn: null,
    rtts: [1, 2, 1],
  },
  {
    ttl: 2,
    ip: "10.10.0.1",
    hostname: "isp-edge.net",
    asn: "AS7018",
    rtts: [11, 12, 10],
  },
  { ttl: 3, ip: null, hostname: null, asn: null, rtts: [null, null, null] },
  {
    ttl: 4,
    ip: "72.14.209.1",
    hostname: "core-peer.net",
    asn: "AS15169",
    rtts: [18, 20, 19],
  },
  {
    ttl: 5,
    ip: "8.8.8.8",
    hostname: "dns.google",
    asn: "AS15169",
    rtts: [22, 21, 23],
  },
];
