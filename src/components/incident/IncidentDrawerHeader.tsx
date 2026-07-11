'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Incident } from '@/types/incident';

interface IncidentDrawerHeaderProps {
  incident: Incident;
  currentIndex: number;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  severityColor: Record<string, string>;
  statusColor: Record<string, string>;
}

export function IncidentDrawerHeader({
  incident,
  currentIndex,
  totalCount,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  closeButtonRef,
  severityColor,
  statusColor,
}: IncidentDrawerHeaderProps) {
  return (
    <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-(--border)">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold text-(--foreground-subtle)">
          {incident.id.toUpperCase()}
        </span>
        <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0', severityColor[incident.severity])}>
          {incident.severity}
        </span>
        <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0', statusColor[incident.status])}>
          {incident.status}
        </span>
      </div>

      {/* Navigation and Close Controls */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Navigation with Positional Context */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-(--foreground-subtle) tracking-wider uppercase shrink-0">
            {currentIndex + 1} of {totalCount}
          </span>
          <div className="flex items-center border border-(--border) rounded-md overflow-hidden shrink-0 bg-(--surface-2)">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className={cn(
                'p-1.5 hover:bg-(--surface-3) transition-colors text-(--foreground-muted) disabled:opacity-40 disabled:hover:bg-transparent',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)'
              )}
              aria-label="Previous Incident"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-px h-4 bg-(--border)" />
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={cn(
                'p-1.5 hover:bg-(--surface-3) transition-colors text-(--foreground-muted) disabled:opacity-40 disabled:hover:bg-transparent',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)'
              )}
              aria-label="Next Incident"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="w-px h-4 bg-(--border)" aria-hidden="true" />

        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-(--surface-3) transition-colors text-(--foreground-muted) hover:text-(--foreground) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
          aria-label="Close incident details"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
