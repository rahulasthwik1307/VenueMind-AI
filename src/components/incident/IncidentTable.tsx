'use client';

/**
 * IncidentTable — Full-featured sortable/filterable incident management table
 *
 * Features:
 * - Multi-select with checkboxes (communicates selection to parent)
 * - Sortable columns (time, severity, status)
 * - Inline timeline expansion per row
 * - Search via incidentTableUtils.filterIncidents
 * - Accessibility: role="grid", aria-sort, aria-selected, aria-expanded
 * - Keyboard: Space toggles selection, Enter expands timeline, arrow keys navigate
 */

import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
  HelpCircle,
  Brain,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { IncidentTimeline } from '@/components/incident/IncidentTimeline';
import { SEVERITY_STYLES, CATEGORY_ICONS, getTimeAgo } from '@/components/operations/CriticalIncidents';
import { sortIncidents, filterIncidents } from '@/utils/incidentTableUtils';
import type { Incident } from '@/types/incident';
import type { IncidentSortKey, SortDirection, IncidentFilters } from '@/utils/incidentTableUtils';

interface IncidentTableProps {
  incidents: Incident[];
  filters: IncidentFilters;
  searchQuery: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onOpenDetails: (id: string) => void;
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <ChevronsUpDown size={11} className="text-(--foreground-subtle)" />;
  return direction === 'asc' ? (
    <ChevronUp size={11} className="text-(--primary)" />
  ) : (
    <ChevronDown size={11} className="text-(--primary)" />
  );
}

interface SortableHeaderProps {
  label: string;
  colKey: IncidentSortKey;
  className?: string;
  sortKey: IncidentSortKey;
  sortDir: SortDirection;
  onSort: (key: IncidentSortKey) => void;
}

function SortableHeader({
  label,
  colKey,
  className,
  sortKey,
  sortDir,
  onSort,
}: SortableHeaderProps) {
  return (
    <button
      onClick={() => onSort(colKey)}
      className={cn(
        'flex items-center gap-1 text-left text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle) hover:text-(--foreground) transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary) rounded',
        className
      )}
      aria-label={`Sort by ${label} ${sortKey === colKey && sortDir === 'asc' ? 'descending' : 'ascending'}`}
    >
      {label}
      <SortIcon active={sortKey === colKey} direction={sortDir} />
    </button>
  );
}

export function IncidentTable({
  incidents,
  filters,
  searchQuery,
  selectedIds,
  onSelectionChange,
  onOpenDetails,
}: IncidentTableProps) {
  const [sortKey, setSortKey] = useState<IncidentSortKey>('time');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  // Apply filter + search, then sort
  const processed = sortIncidents(filterIncidents(incidents, filters, searchQuery), sortKey, sortDir);

  const handleSortColumn = useCallback(
    (key: IncidentSortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('desc');
      }
    },
    [sortKey]
  );

  const handleToggleSelect = useCallback(
    (id: string) => {
      onSelectionChange(
        selectedIds.includes(id) ? selectedIds.filter((s) => s !== id) : [...selectedIds, id]
      );
    },
    [selectedIds, onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === processed.length && processed.length > 0) {
      onSelectionChange([]);
    } else {
      onSelectionChange(processed.map((i) => i.id));
    }
  }, [processed, selectedIds, onSelectionChange]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = processed.length > 0 && selectedIds.length === processed.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < processed.length;

  // Keyboard navigation across rows
  const handleRowKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, incident: Incident, rowIndex: number) => {
      const rows = gridRef.current?.querySelectorAll<HTMLElement>('[data-row]');
      if (!rows) return;

      if (e.key === ' ') {
        e.preventDefault();
        handleToggleSelect(incident.id);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleToggleExpand(incident.id);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        rows[rowIndex + 1]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        rows[rowIndex - 1]?.focus();
      }
    },
    [handleToggleSelect, handleToggleExpand]
  );

  if (processed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-(--surface-1) border border-(--border) rounded-xl">
        <HelpCircle size={28} className="text-(--foreground-subtle) opacity-50 mb-3" />
        <p className="text-sm font-semibold text-(--foreground)">No incidents match your filters</p>
        <p className="text-xs text-(--foreground-muted) mt-1">
          Try adjusting or clearing the active filters.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Incident management table"
      aria-rowcount={processed.length}
      className="@container bg-(--surface-1) border border-(--border) rounded-xl overflow-hidden min-w-0 w-full"
    >
      {/* Header Row */}
      <div
        role="row"
        className="grid items-center gap-3 px-4 py-2.5 bg-(--surface-2) border-b border-(--border) [--table-cols:45px_1fr_70px_80px] sm:[--table-cols:20px_45px_1fr_28px_70px_70px_80px] md:[--table-cols:20px_45px_minmax(120px,1.8fr)_minmax(28px,80px)_70px_minmax(90px,1.2fr)_55px_80px]"
        style={{ gridTemplateColumns: 'var(--table-cols)' }}
      >
        {/* Select All */}
        <div role="columnheader" className="hidden sm:block">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={handleSelectAll}
            aria-label="Select all incidents"
            className="w-3.5 h-3.5 rounded accent-(--primary) cursor-pointer"
          />
        </div>
        <div role="columnheader" className="text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle)">
          Severity
        </div>
        <div role="columnheader" className="text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle)">
          Incident
        </div>
        <div role="columnheader" className="hidden sm:block text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle)">
          <span className="hidden @[400px]:inline">Category</span>
        </div>
        <div
          role="columnheader"
          aria-sort={sortKey === 'status' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
          <SortableHeader
            label="Status"
            colKey="status"
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSortColumn}
          />
        </div>
        <div role="columnheader" className="hidden sm:block text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle)">
          Zone
        </div>
        <div
          role="columnheader"
          className="hidden md:block"
          aria-sort={sortKey === 'time' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
          <SortableHeader
            label="Time"
            colKey="time"
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSortColumn}
          />
        </div>
        <div role="columnheader" className="text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle) text-right w-20">
          Actions
        </div>
      </div>

      {/* Data Rows */}
      <div>
        <AnimatePresence initial={false}>
          {processed.map((incident, rowIndex) => {
            const styles = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.low;
            const CategoryIcon = CATEGORY_ICONS[incident.category] || HelpCircle;
            const isSelected = selectedIds.includes(incident.id);
            const isExpanded = expandedIds.has(incident.id);

            return (
              <m.div
                key={incident.id}
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
                  onKeyDown={(e) => handleRowKeyDown(e, incident, rowIndex)}
                  className={cn(
                    'grid items-center gap-3 px-4 py-3 border-b border-(--border) transition-colors cursor-default outline-none',
                    'focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-(--primary)',
                    '[--table-cols:45px_1fr_70px_80px] sm:[--table-cols:20px_45px_1fr_28px_70px_70px_80px] md:[--table-cols:20px_45px_minmax(120px,1.8fr)_minmax(28px,80px)_70px_minmax(90px,1.2fr)_55px_80px]',
                    isSelected
                      ? 'bg-(--primary-muted)/30'
                      : 'hover:bg-(--surface-2)/60'
                  )}
                  style={{ gridTemplateColumns: 'var(--table-cols)' }}
                >
                  {/* Checkbox */}
                  <div role="gridcell" className="hidden sm:block">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(incident.id)}
                      aria-label={`Select incident: ${incident.title}`}
                      className="w-3.5 h-3.5 rounded accent-(--primary) cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Severity */}
                  <div role="gridcell">
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
                    <p className="text-xs font-semibold text-(--foreground) line-clamp-2 wrap-break-word leading-tight">{incident.title}</p>
                    {incident.aiConfidence && (
                      <div className="flex items-center gap-0.5 mt-0.5 text-[9px] text-(--primary) font-mono whitespace-nowrap shrink-0">
                        <Brain size={8} className="shrink-0" aria-hidden="true" />
                        <span>{incident.aiConfidence}% AI</span>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div role="gridcell" className="hidden sm:block">
                    <div className="flex items-center gap-1.5 text-(--foreground-muted) min-w-0">
                      <CategoryIcon size={12} className="shrink-0" />
                      <span className="truncate text-[10px] capitalize hidden @[400px]:inline">{incident.category}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div role="gridcell">
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
                  <div role="gridcell" className="hidden sm:block min-w-0">
                    <p className="text-[10px] text-(--foreground-muted) line-clamp-2 wrap-break-word leading-normal">{incident.location.zone}</p>
                  </div>

                  {/* Time */}
                  <div role="gridcell" className="hidden md:block">
                    <span className="text-[10px] font-mono text-(--foreground-subtle) whitespace-nowrap" suppressHydrationWarning>
                      {getTimeAgo(incident.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div role="gridcell" className="flex items-center gap-1.5 justify-end w-20">
                    <button
                      onClick={() => handleToggleExpand(incident.id)}
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
          })}
        </AnimatePresence>
      </div>

      {/* Footer count */}
      <div className="px-4 py-2.5 bg-(--surface-2)/40 border-t border-(--border) flex justify-between text-[9px] font-mono text-(--foreground-subtle)">
        <span>{processed.length} incident{processed.length !== 1 ? 's' : ''} shown</span>
        {selectedIds.length > 0 && (
          <span className="text-(--primary) font-bold">{selectedIds.length} selected</span>
        )}
      </div>
    </div>
  );
}
