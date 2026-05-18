import {
  LayoutDashboard,
  // Toolkit icons
  Network,
  Activity,
  ScanSearch,
  Globe,
  ShieldAlert,
  Terminal,
  BookOpen,
  Wrench,
  FolderOpen,
  // Topology tools
  Milestone,
  GitBranch,
  Database,
  // Monitor tools
  Timer,
  Zap,
  Server,
  Gauge,
  // Probe tools
  PlugZap,
  Layers,
  Cpu,
  Lock,
  // Intel tools
  FileSearch,
  Share2,
  Compass,
  MapPin,
  // Threat tools
  Bug,
  AlertTriangle,
  ShieldCheck,
  Shield,
  // References tools
  List,
  FileText,
  Hash,
  BookMarked,
  // Dev Tools tools
  Calculator,
  Code2,
  Tag,
  BarChart2,
  Key,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Types
export type Tool = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  description: string;
};

export type Toolkit = {
  id: string;
  label: string;
  icon: LucideIcon;
  tools: Tool[];
};

// Overview (standalone, not part of any toolkit)
export const OVERVIEW_ITEM = {
  id: "overview",
  label: "Overview",
  icon: LayoutDashboard,
  href: "/overview",
  description: "System status & summary",
} as const;

// Primary toolkits
export const PRIMARY_KITS: Toolkit[] = [
  {
    id: "topology",
    label: "Topology",
    icon: Network,
    tools: [
      {
        id: "topology-map",
        label: "Host Map",
        icon: Network,
        href: "/topology/host-map",
        description: "Subnet discovery and live network map with star topology layout",
      },
      {
        id: "route-trace",
        label: "Route Trace",
        icon: Milestone,
        href: "/topology/route-trace",
        description: "Hop-by-hop path analysis with ASN and latency annotation",
      },
      {
        id: "arp",
        label: "ARP / Layer 2",
        icon: GitBranch,
        href: "/topology/arp",
        description: "MAC-to-IP mapping, OUI resolution, and L2 conflict detection",
      },
      {
        id: "inventory",
        label: "Network Inventory",
        icon: Database,
        href: "/topology/inventory",
        description: "Persistent host records with annotation, tagging, and export",
      },
    ],
  },
  {
    id: "monitor",
    label: "Monitor",
    icon: Activity,
    tools: [
      {
        id: "latency",
        label: "Latency Monitor",
        icon: Timer,
        href: "/monitor/latency",
        description: "Live RTT tracking with jitter, packet loss, and threshold alerting",
      },
      {
        id: "http-probe",
        label: "HTTP / Service Probe",
        icon: Zap,
        href: "/monitor/http-probe",
        description: "Uptime, response time, SSL expiry, and redirect chain monitoring",
      },
      {
        id: "dns-health",
        label: "DNS Health",
        icon: Server,
        href: "/monitor/dns-health",
        description: "Multi-resolver comparison, DNSSEC validation, and propagation checks",
      },
      {
        id: "throughput",
        label: "Throughput Estimator",
        icon: Gauge,
        href: "/monitor/throughput",
        description: "Bandwidth-delay product, TCP throughput, and MTU path discovery",
      },
    ],
  },
  {
    id: "probe",
    label: "Probe",
    icon: ScanSearch,
    tools: [
      {
        id: "ports",
        label: "Port Scanner",
        icon: PlugZap,
        href: "/probe/ports",
        description: "TCP/UDP port discovery with configurable scan techniques and timing",
      },
      {
        id: "services",
        label: "Service Fingerprinting",
        icon: Layers,
        href: "/probe/services",
        description: "Banner grabbing, version detection, and CPE string extraction",
      },
      {
        id: "os",
        label: "OS Detection",
        icon: Cpu,
        href: "/probe/os",
        description: "TCP/IP stack fingerprinting with confidence-scored OS identification",
      },
      {
        id: "ssl",
        label: "SSL / TLS Inspector",
        icon: Lock,
        href: "/probe/ssl",
        description: "Certificate chain, cipher suites, protocol versions, and HSTS analysis",
      },
    ],
  },
  {
    id: "intel",
    label: "Intel",
    icon: Globe,
    tools: [
      {
        id: "whois",
        label: "WHOIS / RDAP",
        icon: FileSearch,
        href: "/intel/whois",
        description: "Domain registration, IP block ownership, and ASN allocation data",
      },
      {
        id: "bgp",
        label: "BGP / ASN",
        icon: Share2,
        href: "/intel/bgp",
        description: "Autonomous system details, announced prefixes, and routing visibility",
      },
      {
        id: "dns",
        label: "DNS Intelligence",
        icon: Compass,
        href: "/intel/dns",
        description: "Full record enumeration, mail security analysis, and zone transfer detection",
      },
      {
        id: "geo",
        label: "Geolocation",
        icon: MapPin,
        href: "/intel/geo",
        description: "IP-to-location with organization context, hosting provider, and proxy detection",
      },
    ],
  },
  {
    id: "threat",
    label: "Threat",
    icon: ShieldAlert,
    tools: [
      {
        id: "cve",
        label: "CVE Lookup",
        icon: Bug,
        href: "/threat/cve",
        description: "CPE-to-CVE mapping against NVD with CVSS scoring and bulk scan analysis",
      },
      {
        id: "port-risk",
        label: "Port Risk Audit",
        icon: AlertTriangle,
        href: "/threat/port-risk",
        description: "Security posture scoring, unnecessary service detection, and CIS baseline checks",
      },
      {
        id: "reputation",
        label: "IP & Domain Reputation",
        icon: ShieldCheck,
        href: "/threat/reputation",
        description: "Multi-feed blocklist check, abuse classification, and threat intelligence lookup",
      },
      {
        id: "security-headers",
        label: "Security Header Audit",
        icon: Shield,
        href: "/threat/security-headers",
        description: "HTTP security header analysis, cookie flags, and CSP validation",
      },
    ],
  },
];

// Console (standalone tool — not a dropdown kit)
export const CONSOLE_TOOL: Tool = {
  id: "terminal",
  label: "Terminal",
  icon: Terminal,
  href: "/console",
  description: "Unified command execution interface for real system tools",
};

// Support toolkits
export const SUPPORT_KITS: Toolkit[] = [
  {
    id: "references",
    label: "References",
    icon: BookOpen,
    tools: [
      {
        id: "ref-ports",
        label: "Port Directory",
        icon: List,
        href: "/references/ports",
        description: "IANA well-known and registered ports with risk classification",
      },
      {
        id: "ref-protocols",
        label: "Protocol Reference",
        icon: FileText,
        href: "/references/protocols",
        description: "IP protocol numbers, ICMP types and codes, transport comparison",
      },
      {
        id: "ref-subnets",
        label: "Subnet & CIDR Tables",
        icon: Hash,
        href: "/references/subnets",
        description: "All prefix lengths /0–/32 with mask, wildcard, and host counts",
      },
      {
        id: "ref-rfc",
        label: "RFC Quick Reference",
        icon: BookMarked,
        href: "/references/rfc",
        description: "Curated index of essential networking RFCs grouped by topic",
      },
    ],
  },
  {
    id: "devtools",
    label: "Dev Tools",
    icon: Wrench,
    tools: [
      {
        id: "subnet",
        label: "Subnet Calculator",
        icon: Calculator,
        href: "/devtools/subnet",
        description: "IPv4/IPv6 subnet math, VLSM planning, and address classification",
      },
      {
        id: "ip",
        label: "IP Utilities",
        icon: Code2,
        href: "/devtools/ip",
        description: "Format conversion, range enumeration, address classification, and IP math",
      },
      {
        id: "mac",
        label: "MAC & OUI Tools",
        icon: Tag,
        href: "/devtools/mac",
        description: "MAC formatting, OUI vendor lookup, EUI-64 generation, and classification",
      },
      {
        id: "data",
        label: "Data & Bandwidth",
        icon: BarChart2,
        href: "/devtools/data",
        description: "Unit conversion, throughput calculation, transfer time, and MTU overhead",
      },
      {
        id: "encode",
        label: "Encode & Hash",
        icon: Key,
        href: "/devtools/encode",
        description: "Base64, SHA hash generation, JWT decode, and URL encoding",
      },
      {
        id: "timestamp",
        label: "Timestamp & Uptime",
        icon: Clock,
        href: "/devtools/timestamp",
        description: "Unix timestamp conversion, SLA uptime calculator, and timezone utility",
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderOpen,
    tools: [],
  },
];

// Combined
export const ALL_KITS: Toolkit[] = [...PRIMARY_KITS, ...SUPPORT_KITS];

// Routing map (breadcrumb resolution)
export const ALL_ROUTES: Record<
  string,
  { label: string; description: string; parent?: string }
> = {
  "/overview": { label: "Overview", description: OVERVIEW_ITEM.description },
  [CONSOLE_TOOL.href]: { label: CONSOLE_TOOL.label, description: CONSOLE_TOOL.description },
  ...ALL_KITS.reduce((acc, kit) => {
    kit.tools.forEach((tool) => {
      acc[tool.href] = {
        label: tool.label,
        description: tool.description,
        parent: kit.label,
      };
    });
    return acc;
  }, {} as Record<string, { label: string; description: string; parent?: string }>),
};
