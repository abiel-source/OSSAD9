"use client";

import { useRef, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import { Network } from "lucide-react";
import { useTopologyStore } from "@/store/topology";
import { useCapabilitiesStore } from "@/store/capabilities";
import { type ScanEvent, type DiscoveredHost } from "@/types/network";
import { ScanLog } from "@/components/tools/host-map/ScanLog";
import { HostMapInputs } from "@/components/tools/host-map/HostMapInputs";
import { HostMapCanvas } from "@/components/tools/host-map/HostMapCanvas";
import { HostMapConfig } from "@/components/tools/host-map/HostMapInputs";

const COMPLIANCES = ["WCAG AA"];

// const MOCK_DATA: DiscoveredHost[] = [
//   {
//     id: "192.168.1.1",
//     ip: "192.168.1.1",
//     hostname: "router.local",
//     mac: "aa:bb:cc:dd:ee:ff",
//     vendor: "Cisco Systems",
//     latencyMs: 2,
//     deviceType: "router",
//   },
//   {
//     id: "192.168.1.42",
//     ip: "192.168.1.42",
//     hostname: "macbook-pro.local",
//     mac: "11:22:33:44:55:66",
//     vendor: "Apple Inc.",
//     latencyMs: 4,
//     deviceType: "device",
//   },
//   {
//     id: "192.168.1.55",
//     ip: "192.168.1.55",
//     hostname: null,
//     mac: "de:ad:be:ef:00:01",
//     vendor: "Espressif Inc.",
//     latencyMs: 8,
//     deviceType: "device",
//   },
//   {
//     id: "192.168.1.101",
//     ip: "192.168.1.101",
//     hostname: "desktop-win.local",
//     mac: "aa:11:bb:22:cc:33",
//     vendor: "Dell Inc.",
//     latencyMs: 3,
//     deviceType: "device",
//   },
//   {
//     id: "192.168.1.210",
//     ip: "192.168.1.210",
//     hostname: null,
//     mac: null,
//     vendor: null,
//     latencyMs: 12,
//     deviceType: "device",
//   },
//   {
//     id: "192.168.1.75",
//     ip: "192.168.1.75",
//     hostname: "iphone-abiel.local",
//     mac: "cc:dd:ee:ff:00:11",
//     vendor: "Apple Inc.",
//     latencyMs: 6,
//     deviceType: "device",
//   },
// ];

const MOCK_DATA: DiscoveredHost[] = [
  {
    id: "10.0.1.1",
    ip: "10.0.1.1",
    hostname: "gateway.local",
    mac: "00:1a:2b:3c:4d:01",
    vendor: "Cisco Systems",
    latencyMs: 1,
    deviceType: "router",
  },
  {
    id: "10.0.1.10",
    ip: "10.0.1.10",
    hostname: "workstation-1.local",
    mac: "00:1a:2b:3c:4d:10",
    vendor: "Dell Inc.",
    latencyMs: 3,
    deviceType: "device",
  },
  {
    id: "10.0.1.20",
    ip: "10.0.1.20",
    hostname: "laptop-1.local",
    mac: "00:1a:2b:3c:4d:20",
    vendor: "Apple Inc.",
    latencyMs: 5,
    deviceType: "device",
  },
  {
    id: "10.0.1.30",
    ip: "10.0.1.30",
    hostname: null,
    mac: "00:1a:2b:3c:4d:30",
    vendor: "Espressif Inc.",
    latencyMs: 8,
    deviceType: "device",
  },
  {
    id: "10.0.1.40",
    ip: "10.0.1.40",
    hostname: "nas.local",
    mac: "00:1a:2b:3c:4d:40",
    vendor: "Hewlett Packard",
    latencyMs: 2,
    deviceType: "device",
  },
  {
    id: "10.0.1.50",
    ip: "10.0.1.50",
    hostname: "phone-1.local",
    mac: "00:1a:2b:3c:4d:50",
    vendor: "Samsung Electronics",
    latencyMs: 6,
    deviceType: "device",
  },
];

export default function TopologyPage() {
  const { isScanning, hosts, startScan, handleScanEvent, reset } =
    useTopologyStore();

  // SSE Event Loop
  const handleDiscover = async (cidr: string) => {
    if (isScanning || !cidr.trim()) return;

    reset();
    startScan();

    const url = `/api/topology/discover?cidr=${encodeURIComponent(
      cidr.trim()
    )}`;

    try {
      const res = await fetch(url);
      if (!res.ok || !res.body) {
        handleScanEvent({ type: "error", message: `HTTP ${res.status}` });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          try {
            const event: ScanEvent = JSON.parse(dataLine.slice(5).trim());
            handleScanEvent(event);
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        handleScanEvent({
          type: "error",
          message: err?.message ?? "Unknown error",
        });
      }
    }
  };

  // REAL BACKEND HANDLER
  // const handleRun = (config: HostMapConfig) => {
  //   handleDiscover(config.target);
  // };

  ////////////////////////////////////////////////////
  /////////// HANDLER FOR MOCK DATA TESTING //////////
  ////////////////////////////////////////////////////
  const {
    timeoutRefs,
    dispatchedCountRef,
    appendTimeoutRef,
    emptyTimeoutRefs,
    incrementDispatchCount,
  } = useTopologyStore();

  const handleRun = (config: HostMapConfig) => {
    timeoutRefs.forEach((t) => window.clearTimeout(t));
    reset();
    startScan();
    handleScanEvent({
      type: "log",
      level: "info",
      message: "Starting HOST MAP v1.0.0...",
    });
    handleScanEvent({
      type: "log",
      level: "warning",
      message: "Remote deployment detected",
    });
    handleScanEvent({
      type: "log",
      level: "warning",
      message:
        "Running HOST MAP remotely violates Vercel server TOS - simulating network data instead",
    });
    handleScanEvent({
      type: "log",
      level: "info",
      message: "To HOST MAP your LAN consider switching to a local deployment",
    });

    MOCK_DATA.forEach((host, i) => {
      const t = window.setTimeout(() => {
        handleScanEvent({ type: "host_discovered", host });
        handleScanEvent({
          type: "log",
          level: "success",
          message: `Discovered host ${host.ip}`,
        });
        handleScanEvent({
          type: "log",
          level: "info",
          message: `${host.ip}${
            host.hostname ? ` name: (${host.hostname})` : ""
          }${host.mac ? ` mac: ${host.mac}` : ""}${
            host.vendor ? ` vendor: ${host.vendor}` : ""
          }${host.deviceType ? ` device type: ${host.deviceType}` : ""}`,
        });

        incrementDispatchCount();
      }, (i + 1) * 500);

      appendTimeoutRef(t);
    });

    const completionT = window.setTimeout(() => {
      handleScanEvent({
        type: "complete",
        hostsFound: MOCK_DATA.length,
        durationMs: 3000,
      });
    }, (MOCK_DATA.length + 1) * 500);

    appendTimeoutRef(completionT);
  };

  const handleResume = () => {
    const dispatchCount = dispatchedCountRef;

    handleScanEvent({
      type: "log",
      level: "info",
      message: "Resuming host discovery...",
    });

    // handle completion
    if (dispatchCount === MOCK_DATA.length) {
      const completionT = window.setTimeout(() => {
        handleScanEvent({
          type: "complete",
          hostsFound: MOCK_DATA.length,
          durationMs: 3000,
        });
      }, 500);

      appendTimeoutRef(completionT);
      return;
    }

    // still more data
    MOCK_DATA.slice(dispatchCount).forEach((host, i) => {
      const t = window.setTimeout(() => {
        handleScanEvent({ type: "host_discovered", host });
        handleScanEvent({
          type: "log",
          level: "success",
          message: `Discovered host ${host.ip}`,
        });
        handleScanEvent({
          type: "log",
          level: "info",
          message: `${host.ip}${
            host.hostname ? ` name: (${host.hostname})` : ""
          }${host.mac ? ` mac: ${host.mac}` : ""}${
            host.vendor ? ` vendor: ${host.vendor}` : ""
          }${host.deviceType ? ` device type: ${host.deviceType}` : ""}`,
        });

        incrementDispatchCount();
      }, (i + 1) * 500);

      appendTimeoutRef(t);
    });

    const completionT = window.setTimeout(() => {
      handleScanEvent({
        type: "complete",
        hostsFound: MOCK_DATA.length,
        durationMs: 3000,
      });
    }, (MOCK_DATA.length + 1 - dispatchCount) * 500);

    appendTimeoutRef(completionT);
  };

  const handleStop = () => {
    timeoutRefs.forEach((t) => window.clearTimeout(t));
    emptyTimeoutRefs();
  };
  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////

  // Returns index of the best-guess gateway node
  function filterGateway(hosts: DiscoveredHost[]): number {
    const hostNum = (ip: string): number =>
      ip.split(".").reduce((acc, oct) => acc * 256 + parseInt(oct, 10), 0);

    let idx = 0;
    for (let i = 0; i < hosts.length; i++) {
      if (hosts[i].deviceType === "router") return i;

      const last = parseInt(hosts[i].ip.split(".").pop() ?? "0", 10);
      if (last === 1 || last === 254) {
        idx = i;
        continue;
      }

      const lastIdx = parseInt(hosts[idx].ip.split(".").pop() ?? "0", 10);
      if (
        hostNum(hosts[i].ip) < hostNum(hosts[idx].ip) &&
        lastIdx !== 1 &&
        lastIdx !== 254
      ) {
        idx = i;
      }
    }

    return idx;
  }

  const hostList = Object.values(hosts);
  if (hostList.length > 0) {
    const idx = filterGateway(hostList);
    hostList[idx] = { ...hostList[idx], deviceType: "router" };
  }

  return (
    <div>
      <ToolHeader
        title="Host Map"
        description="Network map & host discovery — enter a CIDR range to begin."
        icon={Network}
        rfcBadges={COMPLIANCES}
        onExportJSON={() => console.log("export json")}
        onExportCSV={() => console.log("export csv")}
        onLoadFromProject={() => console.log("load")}
        onSaveToProject={() => console.log("save")}
      />

      <HostMapInputs
        onRun={handleRun}
        onReset={reset}
        onStop={handleStop}
        onResume={handleResume}
        isRunning={isScanning}
      />

      <ScanLog />
      <HostMapCanvas nodes={hostList} isRunning={isScanning} />
    </div>
  );
}
