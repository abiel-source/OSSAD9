"use client";

import { Download, FolderOpen, Save } from "lucide-react";
import { ComplianceBadge } from "./ComplianceBadge";
import { ToolHeaderButton } from "./ToolHeaderButton";

interface ToolHeaderProps {
  title: string;
  description: string;
  rfcBadges?: string[];

  onExportJSON?: () => void;
  onExportCSV?: () => void;

  onLoadFromProject?: () => void;
  onSaveToProject?: () => void;
}

export default function ToolHeader({
  title,
  description,
  rfcBadges = [],
  onExportJSON,
  onExportCSV,
  onLoadFromProject,
  onSaveToProject,
}: ToolHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      {/* Left: title + description */}
      <div className="flex flex-col gap-1">
        <h1
          className="text-[15px] font-semibold tracking-[0.04em]"
          style={{ color: "var(--ossad-text-primary)" }}
        >
          {title}
        </h1>
        <p
          className="text-[12px] font-mono"
          style={{ color: "var(--ossad-text-secondary)" }}
        >
          {description}
        </p>
      </div>

      {/* Right: RFC badges + export buttons */}
      <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
        {/* Export buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <ToolHeaderButton
            onClick={onExportJSON}
            icon={<Download size={11} />}
            label="Export JSON"
          />
          <ToolHeaderButton
            onClick={onExportCSV}
            icon={<Download size={11} />}
            label="Export CSV"
          />
          <ToolHeaderButton
            onClick={onLoadFromProject}
            icon={<FolderOpen size={11} />}
            label="Load"
          />
          <ToolHeaderButton
            onClick={onSaveToProject}
            icon={<Save size={11} />}
            label="Save"
          />
        </div>

        {/* RFC badges */}
        {rfcBadges.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {rfcBadges.map((badge) => (
              <ComplianceBadge key={badge} rfcBadge={badge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
