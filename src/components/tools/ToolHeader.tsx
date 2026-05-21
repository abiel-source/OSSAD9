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
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-7">
      {/* Left: title + description */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-[0.02em] text-foreground font-heading">
          {title}
        </h1>
        <p className="text-[12px] text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Right: RFC badges + action buttons */}
      <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <ToolHeaderButton onClick={onExportJSON} icon={<Download size={13} />} label="Export JSON" />
          <ToolHeaderButton onClick={onExportCSV} icon={<Download size={13} />} label="Export CSV" />
          <ToolHeaderButton onClick={onLoadFromProject} icon={<FolderOpen size={13} />} label="Load" />
          <ToolHeaderButton onClick={onSaveToProject} icon={<Save size={13} />} label="Save" />
        </div>

        {rfcBadges.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {rfcBadges.map((badge) => (
              <ComplianceBadge key={badge} rfcBadge={badge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
