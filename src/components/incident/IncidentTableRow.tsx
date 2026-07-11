'use client';

import { AnimatePresence, m } from 'framer-motion';
import { HelpCircle, Brain, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { IncidentTimeline } from './IncidentTimeline';
import { SEVERITY_STYLES, CATEGORY_ICONS, getTimeAgo } from '@/utils/incidentUtils';
import type { Incident } from '@/types/incident';

interface IncidentTableRowProps {
  incident: Incident;
  rowIndex: number;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onOpenDetails: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, incident: Incident, rowIndex: number) => void;
}

export function IncidentTableRow({
  incident,
  rowIndex,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onOpenDetails,
  onKeyDown,
}: IncidentTableRowProps) {
  const styles = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.low;
  const CategoryIcon = CATEGORY_ICONS[incident.category] || HelpCircle;
  const zoneParts = incident.location.zone.split(' · ');

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Main Row */}
      <div
        role="row"
        data-row
        tabIndex={0}
        aria-selected={isSelected}
        aria-expanded={isExpanded}
        aria-rowindex={rowIndex + 1}
        onKeyDown={(e) => onKeyDown(e, incident, rowIndex)}
        className={cn(
          'grid items-start gap-3 px-4 py-3 border-b border-(--border) transition-colors cursor-default outline-none',
          'focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-(--primary)',
          '[--table-cols:68px_1fr_76px_96px] @[600px]:[--table-cols:20px_68px_minmax(140px,2.5fr)_minmax(85px,1fr)_76px_minmax(110px,1.8fr)_64px_96px]',
          isSelected
            ? 'bg-(--primary-muted)/30'
            : 'hover:bg-(--surface-2)/60'
        )}
        style={{ gridTemplateColumns: 'var(--table-cols)' }}
      >
        {/* Checkbox */}
        <div role="gridcell" className="hidden @[600px]:block pt-0.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(incident.id)}
            aria-label={`Select incident: ${incident.title}`}
            className="w-3.5 h-3.5 rounded accent-(--primary) cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Severity */}
        <div role="gridcell" className="pt-0.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border font-mono tracking-wide',
              styles.bg,
              styles.text,
              styles.border
            )}
          >
            <span className={cn('w-1 h-1 rounded-full shrink-0', styles.dot)} aria-hidden="true" />
            {incident.severity}
          </span>
        </div>

        {/* Title */}
        <div role="gridcell" className="min-w-0">
          <p className="text-xs font-semibold text-(--foreground) wrap-break-word leading-tight">{incident.title}</p>
          {incident.aiConfidence && (
            <div className="flex items-center gap-0.5 mt-0.5 text-[9px] text-(--primary) font-mono whitespace-nowrap shrink-0">
              <Brain size={8} className="shrink-0" aria-hidden="true" />
              <span>{incident.aiConfidence}% AI</span>
            </div>
          )}
        </div>

        {/* Category */}
        <div role="gridcell" className="hidden @[600px]:block min-w-0 pt-0.5">
          <div className="flex items-start gap-1.5 text-(--foreground-muted) min-w-0">
            <CategoryIcon size={12} className="shrink-0 mt-0.5" />
            <span className="text-[10px] capitalize leading-tight wrap-break-word">{incident.category}</span>
          </div>
        </div>

        {/* Status */}
        <div role="gridcell" className="pt-0.5">
          <span
            className={cn(
              'text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide',
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

        {/* Zone */}
        <div role="gridcell" className="hidden @[600px]:block min-w-0 pt-0.5">
          <div className="flex flex-col text-[10px] text-(--foreground-muted) leading-tight">
            {zoneParts.map((part, i) => {
              const formatted = part.replace(/\s+(\d+)/g, '\u00a0$1');
              return (
                <span key={i} className="block wrap-break-word">
                  {formatted}
                  {i < zoneParts.length - 1 && (
                    <span className="text-(--foreground-subtle)/50 select-none"> ·</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Time */}
        <div role="gridcell" className="hidden @[600px]:block pt-0.5">
          <span className="text-[10px] text-(--foreground-subtle) whitespace-nowrap" suppressHydrationWarning>
            {getTimeAgo(incident.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div role="gridcell" className="flex items-start gap-1.5 justify-end w-24 pt-0.5">
          <button
            onClick={() => onToggleExpand(incident.id)}
            className={cn(
              'text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all cursor-pointer',
              'text-(--foreground-muted) border-(--border) bg-(--surface-2)',
              'hover:text-(--foreground) hover:border-(--border-strong)',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)'
            )}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} timeline for ${incident.title}`}
          >
            <ChevronRight
              size={10}
              className={cn('transition-transform duration-200', isExpanded && 'rotate-90')}
            />
          </button>
          <button
            onClick={() => onOpenDetails(incident.id)}
            className={cn(
              'text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all cursor-pointer',
              'text-(--primary) border-(--primary-light) bg-(--primary-muted)',
              'hover:bg-(--primary) hover:text-white',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)'
            )}
            aria-label={`Open full details for incident: ${incident.title}`}
          >
            Details
          </button>
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
            className="overflow-hidden border-b border-(--border)"
            role="region"
            aria-label={`Timeline for ${incident.title}`}
          >
            <div className="px-6 py-4 bg-(--surface-2)/40">
              <p className="text-[9px] font-mono font-bold text-(--foreground-subtle) uppercase tracking-wider mb-3">
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
