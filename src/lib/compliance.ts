export const complianceRecord = new Map<string, string>([
  // Topology > Route Trace
  [
    "RFC 792",
    "Defines ICMP - the protocol underlying TTL-exceeded messages used by traceroute",
  ],
  [
    "RFC 1393",
    "Traceroute using IP options - an alternative tracing mechanism",
  ],
  [
    "RFC 2544",
    "Benchmarking methodology for network interconnect devices - latency measurement standards",
  ],
  ["RFC 4443", "ICMPv6 - required for tracing IPv6 routes"],

  // Topology > ARP Inspector
  [
    "RFC 826",
    "Defines ARP - the protocol for mapping IPv4 addresses to MAC addresses",
  ],
  [
    "RFC 5227",
    "IPv4 Address Conflict Detection - defines behaviour when duplicate IPs are found",
  ],
  [
    "RFC 7042",
    "MAC address structure, OUI assignment, and IANA considerations",
  ],
  [
    "RFC 1122",
    "Host requirements - governs ARP cache behaviour, entry timeouts, and retransmission",
  ],
]);
