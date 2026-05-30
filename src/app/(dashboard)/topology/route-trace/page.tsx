"use client";

import { useRef } from "react";
import ToolHeader from "@/components/ui/ToolHeader";
import { Milestone } from "lucide-react";
import { useCapabilitiesStore } from "@/store/capabilities";
import TraceInputs, {
  TraceConfig,
} from "@/components/tools/route-trace/TraceInputs";
import TraceCanvas from "@/components/tools/route-trace/TraceCanvas";
import TraceDetails from "@/components/tools/route-trace/TraceDetails";
import { useRouteTraceStore } from "@/store/routetrace";
import { Hop } from "@/types/network";

import { CompletionIndicator } from "@/lib/graph";

const COMPLIANCES = ["RFC 792", "RFC 1393", "RFC 2544", "RFC 4443"];

// const MOCK_DATA: Hop[] = [
//   {
//     ttl: 1,
//     ip: "192.168.1.1",
//     hostname: "router.local",
//     asn: "AS1234",
//     rtts: [1, 2, 1],
//   },
//   {
//     ttl: 2,
//     ip: "10.0.0.1",
//     hostname: "isp-gateway.net",
//     asn: "AS5678",
//     rtts: [12, 11, 13],
//   },
//   { ttl: 3, ip: null, hostname: null, asn: null, rtts: [null, null, null] },
//   {
//     ttl: 4,
//     ip: "72.14.209.1",
//     hostname: "google-peering.net",
//     asn: "AS15169",
//     rtts: [18, 20, 19],
//   },
//   {
//     ttl: 5,
//     ip: "8.8.8.8",
//     hostname: "dns.google",
//     asn: "AS15169",
//     rtts: [22, 21, 23],
//   },
// ];

const MOCK_DATA: Hop[] = [
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

export default function RouteTracePage() {
  const { hops, isRunning, setHops, appendHops, setIsRunning, reset } =
    useRouteTraceStore();

  ////////////////////////////////////////////////////
  /////////// HANDLER FOR MOCK DATA TESTING //////////
  ////////////////////////////////////////////////////
  // const timeoutRefs = useRef<number[]>([]);
  // const dispatchedCountRef = useRef<number>(0);
  const {
    timeoutRefs,
    dispatchedCountRef,
    appendTimeoutRef,
    emptyTimeoutRefs,
    incrementDispatchCount,
  } = useRouteTraceStore();

  const handleRun = (config: TraceConfig) => {
    timeoutRefs.forEach((t) => window.clearTimeout(t));
    reset();
    setIsRunning(true);

    MOCK_DATA.forEach((hop, i) => {
      const t = window.setTimeout(() => {
        appendHops([hop]);
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

    // edge case: complete all mock data before completion window
    if (dispatchCount === MOCK_DATA.length) {
      const completionT = window.setTimeout(() => {
        setIsRunning(false);
      }, 500);

      appendTimeoutRef(completionT);
      return;
    }

    // general: queue remaining data + completion timeout
    MOCK_DATA.slice(dispatchCount).forEach((hop, i) => {
      const t = window.setTimeout(() => {
        appendHops([hop]);
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
        title="Route Trace"
        description="Map the hop-by-hop path packets take to a target host"
        icon={Milestone}
        rfcBadges={COMPLIANCES}
        onExportJSON={() => console.log("export json")}
        onExportCSV={() => console.log("export csv")}
        onLoadFromProject={() => console.log("load")}
        onSaveToProject={() => console.log("save")}
      />
      <TraceInputs
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
        onResume={handleResume}
        onReset={reset}
      />
      <TraceCanvas hops={hops} isRunning={isRunning} />
      <TraceDetails hops={hops} />
    </div>
  );
}
