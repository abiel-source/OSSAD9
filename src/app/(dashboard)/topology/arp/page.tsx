"use client";

import { useRef } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import {
  ArpInspectInputs,
  ArpInspectConfig,
} from "@/components/tools/arp-inspect/ArpInspectInputs";
import { ArpInspectDetails } from "@/components/tools/arp-inspect/ArpInspectDetails";
import { useArpStore } from "@/store/arp";
import { ArpEntry } from "@/components/tools/arp-inspect/ArpInspectDetails";

const COMPLIANCES = ["RFC 826", "RFC 5227", "RFC 7042", "RFC 1122"];

// const MOCK_DATA: ArpEntry[] = [
//   {
//     ip: "192.168.1.1",
//     mac: "aa:bb:cc:dd:ee:ff",
//     vendor: "Cisco Systems",
//     interface: "ETH0",
//     entryType: "static",
//     ttl: null,
//     conflict: null,
//   },
//   {
//     ip: "192.168.1.42",
//     mac: "11:22:33:44:55:66",
//     vendor: "Apple Inc.",
//     interface: "EN0",
//     entryType: "dynamic",
//     ttl: 180,
//     conflict: null,
//   },
//   {
//     ip: "192.168.1.101",
//     mac: "de:ad:be:ef:00:01",
//     vendor: null,
//     interface: "ETH0",
//     entryType: "dynamic",
//     ttl: 45,
//     conflict: "duplicate-ip",
//   },
//   {
//     ip: "192.168.1.200",
//     mac: "de:ad:be:ef:00:01",
//     vendor: null,
//     interface: "ETH0",
//     entryType: "dynamic",
//     ttl: 60,
//     conflict: "duplicate-mac",
//   },
//   {
//     ip: "192.168.1.1",
//     mac: "11:22:33:44:55:66",
//     vendor: "Apple Inc.",
//     interface: "EN0",
//     entryType: "dynamic",
//     ttl: 90,
//     conflict: "static-violation",
//   },
// ];

const MOCK_DATA: ArpEntry[] = [
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

export default function ArpMapPage() {
  const { entries, isRunning, setEntries, appendEntries, setIsRunning, reset } =
    useArpStore();

  ////////////////////////////////////////////////////
  /////////// HANDLER FOR MOCK DATA TESTING //////////
  ////////////////////////////////////////////////////
  const {
    timeoutRefs,
    dispatchedCountRef,
    appendTimeoutRef,
    emptyTimeoutRefs,
    incrementDispatchCount,
  } = useArpStore();

  const handleRun = (config: ArpInspectConfig) => {
    timeoutRefs.forEach((t) => window.clearTimeout(t));
    reset();
    setIsRunning(true);

    MOCK_DATA.forEach((entry, i) => {
      const t = window.setTimeout(() => {
        appendEntries([entry]);
        incrementDispatchCount();
      }, (i + 1) * 500);

      appendTimeoutRef(t);
    });

    const completionT = window.setTimeout(() => {
      setIsRunning(false);
    }, (MOCK_DATA.length + 1) * 500);

    appendTimeoutRef(completionT);
  };

  const handleResume = () => {
    const dispatchCount = dispatchedCountRef;

    if (dispatchCount === MOCK_DATA.length) {
      const completionT = window.setTimeout(() => {
        setIsRunning(false);
      }, 500);

      appendTimeoutRef(completionT);
      return;
    }

    MOCK_DATA.slice(dispatchCount).forEach((entry, i) => {
      const t = window.setTimeout(() => {
        appendEntries([entry]);
        incrementDispatchCount();
      }, (i + 1) * 500);

      appendTimeoutRef(t);
    });

    const completionT = window.setTimeout(() => {
      setIsRunning(false);
    }, (MOCK_DATA.length - dispatchCount + 1) * 500);

    appendTimeoutRef(completionT);
  };

  const handleStop = () => {
    timeoutRefs.forEach((t) => window.clearTimeout(t));
    emptyTimeoutRefs();
  };
  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////

  return (
    <div>
      <ToolHeader
        title="ARP / Layer 2 Inspector"
        description="MAC-to-IP mapping, OUI vendor resolution, and Layer 2 conflict detection across the local subnet."
        rfcBadges={COMPLIANCES}
        onExportJSON={() => console.log("export json")}
        onExportCSV={() => console.log("export csv")}
        onLoadFromProject={() => console.log("load")}
        onSaveToProject={() => console.log("save")}
      />

      <ArpInspectInputs
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
        onResume={handleResume}
        onReset={reset}
      />

      <ArpInspectDetails entries={entries} />

      {/* add topology graph visualizing arp  */}
    </div>
  );
}
