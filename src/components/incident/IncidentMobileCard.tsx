'use client';

import { AnimatePresence, m } from 'framer-motion';
import { HelpCircle, Brain, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { IncidentTimeline } from './IncidentTimeline';
import { SEVERITY_STYLES, CATEGORY_ICONS, getTimeAgo } from '@/utils/incidentUtils';
import type { Incident } from '@/types/incident';

interface IncidentMobileCardProps {
  incident: Incident;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onOpenDetails: (id: string) => void;
}

export function IncidentMobileCard({
  incident,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onOpenDetails,
}: IncidentMobileCardProps) {
  const styles = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.low;
  const CategoryIcon = CATEGORY_ICONS[incident.category] || HelpCircle;
  const formattedZone = incident.location.zone.replace(/\s+(\d+)/g, '\u00a0$1');

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex flex-col bg-(--surface-1) border rounded-xl overflow-hidden transition-all',
        isSelected ? 'border-(--primary) ring-1 ring-(--primary) bg-(--primary-muted)/20' : 'border-(--border) shadow-sm'
      )}
    >
      {/* Card Header & Content */}
      <div
        className="p-4 cursor-pointer relative"
        onClick={() => onToggleExpand(incident.id)}
      >
        {/* Top Row: Checkbox, Severity, Status */}
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(incident.id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select incident: ${incident.title}`}
              className="w-4 h-4 rounded accent-(--primary) cursor-pointer shrink-0 mt-0.5"
            />
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border font-mono tracking-wide',
                styles.bg,
                styles.text,
                styles.border
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', styles.dot)} aria-hidden="true" />
              {incident.severity}
            </span>
          </div>

          <span
            className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0',
              incident.status === 'open' &&
                'text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-400',
              incident.status === 'investigating' &&
                'text-yellow-700 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400',
              incident.status === 'mitigated' &&
                'text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400',
              incident.status === 'resolved' &&
                'text-green-700 bg-green-50 dark:bg-green-950/20 dark:text-green-400'
            )}
          >
            {incident.status}
          </span>
        </div>

        <p className="text-base font-bold text-(--foreground) leading-tight mb-3 wrap-break-word line-clamp-3">
          {incident.title}
        </p>

        {/* Metadata Stack */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-(--foreground-muted)">
            <CategoryIcon size={14} className="shrink-0" />
            <span className="truncate">{formattedZone}</span>
          </div>

          {incident.aiConfidence && (
            <div className="flex items-center gap-2 text-[11px] text-(--primary) font-mono">
              <Brain size={12} className="shrink-0" aria-hidden="true" />
              <span>{incident.aiConfidence}% AI Confidence</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-(--foreground-subtle) font-mono" suppressHydrationWarning>
              {getTimeAgo(incident.createdAt)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(incident.id);
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-(--primary) uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-(--primary-muted) transition-colors active:scale-95"
            >
              Details <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Inline Timeline Expansion */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <m.div
            key={`timeline-${incident.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-(--border)"
            role="region"
            aria-label={`Timeline for ${incident.title}`}
          >
            <div className="p-4 bg-(--surface-2)/50">
              <p className="text-[10px] font-mono font-bold text-(--foreground-subtle) uppercase tracking-widest mb-3">
                 Incident Timeline
              </p>
              <IncidentTimeline events={incident.timeline} />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}
