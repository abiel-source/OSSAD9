"use client";

import { useRef } from "react";
import ToolHeader from "@/components/ui/ToolHeader";
import { GitBranch } from "lucide-react";
import { useCapabilitiesStore } from "@/store/capabilities";
import {
  ArpInspectInputs,
  ArpInspectConfig,
} from "@/components/tools/arp-inspect/ArpInspectInputs";
import { ArpInspectDetails } from "@/components/tools/arp-inspect/ArpInspectDetails";
import { useArpStore } from "@/store/arp";
import { MOCK_DATA } from "@/data/mock/arp-inspect";

const COMPLIANCES = ["RFC 826", "RFC 5227", "RFC 7042", "RFC 1122"];

export default function ArpMapPage() {
  const { entries, isRunning, appendEntries, setIsRunning, reset } =
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
      const t = window.setTimeout(
        () => {
          appendEntries([entry]);
          incrementDispatchCount();
        },
        (i + 1) * 500,
      );

      appendTimeoutRef(t);
    });

    const completionT = window.setTimeout(
      () => {
        setIsRunning(false);
      },
      (MOCK_DATA.length + 1) * 500,
    );

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
      const t = window.setTimeout(
        () => {
          appendEntries([entry]);
          incrementDispatchCount();
        },
        (i + 1) * 500,
      );

      appendTimeoutRef(t);
    });

    const completionT = window.setTimeout(
      () => {
        setIsRunning(false);
      },
      (MOCK_DATA.length - dispatchCount + 1) * 500,
    );

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
        icon={GitBranch}
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
