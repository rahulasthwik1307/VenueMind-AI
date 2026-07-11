'use client';

import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { IncidentSortKey, SortDirection } from '@/utils/incidentTableUtils';

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

export function SortableHeader({
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
