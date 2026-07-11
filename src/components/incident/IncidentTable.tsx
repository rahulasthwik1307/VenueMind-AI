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

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SortableHeader } from './SortableHeader';
import { IncidentTableRow } from './IncidentTableRow';
import { sortIncidents, filterIncidents } from '@/utils/incidentTableUtils';
import { APP_CONFIG } from '@/constants/config';
import type { Incident } from '@/types/incident';
import type { IncidentSortKey, SortDirection, IncidentFilters } from '@/utils/incidentTableUtils';

interface IncidentTableProps {
  incidents: Incident[];
  filters: IncidentFilters;
  searchQuery: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onOpenDetails: (id: string) => void;
  cardHeight?: number;
}

export function IncidentTable({
  incidents,
  filters,
  searchQuery,
  selectedIds,
  onSelectionChange,
  onOpenDetails,
  cardHeight,
}: IncidentTableProps) {
  const [sortKey, setSortKey] = useState<IncidentSortKey>('time');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Apply filter + search, then sort
  const processed = sortIncidents(filterIncidents(incidents, filters, searchQuery), sortKey, sortDir);

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth, scrollTop, scrollHeight, clientHeight } = el;
    setShowLeftShadow(scrollLeft > 2);
    setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 2);
    setShowBottomShadow(scrollTop < scrollHeight - clientHeight - 2 && scrollHeight > clientHeight);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScroll();
    }, APP_CONFIG.SCROLL_CHECK_DEBOUNCE_MS);

    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [processed, cardHeight, expandedIds, checkScroll]);

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
      className="@container bg-(--surface-1) border border-(--border) rounded-xl overflow-hidden min-w-0 w-full flex flex-col"
      style={cardHeight ? { height: `${cardHeight}px` } : undefined}
    >
      <div className="relative min-w-0 w-full flex-1 min-h-0 flex flex-col">
        {/* Left scroll shadow hint */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-black/5 dark:from-black/20 to-transparent pointer-events-none transition-opacity duration-200 z-10',
            showLeftShadow ? 'opacity-100' : 'opacity-0'
          )}
        />
        {/* Right scroll shadow hint */}
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-black/5 dark:from-black/20 to-transparent pointer-events-none transition-opacity duration-200 z-10',
            showRightShadow ? 'opacity-100' : 'opacity-0'
          )}
        />

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="overflow-x-auto overflow-y-auto min-w-0 w-full custom-scrollbar-always scrollbar-thin flex-1 min-h-0"
        >
        <div className="min-w-0 @[600px]:min-w-195 w-full">
          {/* Header Row */}
          <div
            role="row"
            className="grid items-center gap-3 px-4 py-2.5 bg-(--surface-2) border-b border-(--border) [--table-cols:68px_1fr_76px_96px] @[600px]:[--table-cols:20px_68px_minmax(140px,2.5fr)_minmax(85px,1fr)_76px_minmax(110px,1.8fr)_64px_96px] sticky top-0 z-20"
            style={{ gridTemplateColumns: 'var(--table-cols)' }}
          >
            {/* Select All */}
            <div role="columnheader" className="hidden @[600px]:block">
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
            <div role="columnheader" className="hidden @[600px]:block text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle)">
              Category
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
            <div role="columnheader" className="hidden @[600px]:block text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle)">
              Zone
            </div>
            <div
              role="columnheader"
              className="hidden @[600px]:block"
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
            <div role="columnheader" className="text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle) text-right w-24">
              Actions
            </div>
          </div>

          {/* Data Rows */}
          <div>
            <AnimatePresence initial={false}>
              {processed.map((incident, rowIndex) => (
                <IncidentTableRow
                  key={incident.id}
                  incident={incident}
                  rowIndex={rowIndex}
                  isSelected={selectedIds.includes(incident.id)}
                  isExpanded={expandedIds.has(incident.id)}
                  onToggleSelect={handleToggleSelect}
                  onToggleExpand={handleToggleExpand}
                  onOpenDetails={onOpenDetails}
                  onKeyDown={handleRowKeyDown}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
        </div>
        {/* Bottom scroll shadow hint */}
        <div
          className={cn(
            'absolute left-0 right-0 bottom-0 h-6 bg-linear-to-t from-black/5 dark:from-black/20 to-transparent pointer-events-none transition-opacity duration-200 z-10',
            showBottomShadow ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      {/* Footer count */}
      <div className="px-4 py-2.5 bg-(--surface-2)/40 border-t border-(--border) flex justify-between items-center text-[9px] font-mono text-(--foreground-subtle)">
        <span>{processed.length} incident{processed.length !== 1 ? 's' : ''} shown</span>
        <div className="flex items-center gap-4">
          {showBottomShadow && (
            <span className="text-(--primary) font-bold animate-pulse flex items-center gap-1 select-none">
              ↓ Scroll down to view more incidents
            </span>
          )}
          {showRightShadow && (
            <span className="text-(--primary) font-bold animate-pulse flex items-center gap-1 select-none">
              Scroll right to view actions →
            </span>
          )}
          {selectedIds.length > 0 && (
            <span className="text-(--primary) font-bold">{selectedIds.length} selected</span>
          )}
        </div>
      </div>
    </div>
  );
}
