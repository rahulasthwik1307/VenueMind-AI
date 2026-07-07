'use client';

/**
 * IncidentQueuePanel — Live Incident Queue
 *
 * Left panel showing all incidents sorted by severity and status.
 * Clicking an incident focuses the stadium camera and activates
 * AI analysis panel — via the useDigitalTwin hook.
 *
 * Local Storage Mappings:
 * - incident_filter: Selected category filter.
 * - incident_show_resolved: Toggle for resolved items.
 */

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Search,
  Filter,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Incident } from '@/types/incident';

interface IncidentQueuePanelProps {
  incidents: Incident[];
  activeIncidentId: string | null;
  onIncidentClick: (id: string) => void;
}

type FilterCategory = 'all' | 'crowd' | 'medical' | 'security' | 'transport' | 'infrastructure';

const SEVERITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  high: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  medium: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  low: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

const STATUS_LABEL: Record<string, string> = {
  open: 'OPEN',
  investigating: 'ACTIVE',
  mitigated: 'MITIGATING',
  resolved: 'RESOLVED',
};

const CATEGORY_FILTERS: { id: FilterCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'crowd', label: 'Crowd' },
  { id: 'medical', label: 'Medical' },
  { id: 'security', label: 'Security' },
  { id: 'transport', label: 'Transport' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

export function IncidentQueuePanel({
  incidents,
  activeIncidentId,
  onIncidentClick,
}: IncidentQueuePanelProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [showResolved, setShowResolved] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedFilter = localStorage.getItem('incident_filter');
      if (savedFilter) setFilter(savedFilter as FilterCategory);

      const savedShowResolved = localStorage.getItem('incident_show_resolved');
      if (savedShowResolved) setShowResolved(savedShowResolved === 'true');
    } catch (e) {
      // ignore
    }
  }, []);

  const handleFilterChange = (cat: FilterCategory) => {
    setFilter(cat);
    try {
      localStorage.setItem('incident_filter', cat);
    } catch (e) {
      // ignore
    }
  };

  const handleToggleResolved = () => {
    const next = !showResolved;
    setShowResolved(next);
    try {
      localStorage.setItem('incident_show_resolved', String(next));
    } catch (e) {
      // ignore
    }
  };

  const filtered = incidents.filter((i) => {
    if (!showResolved && i.status === 'resolved') return false;
    if (filter !== 'all' && i.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return i.title.toLowerCase().includes(q) || i.location.zone.toLowerCase().includes(q);
    }
    return true;
  });

  const openCount = incidents.filter((i) => i.status !== 'resolved').length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="px-3 pt-3 pb-2 border-b border-(--border) shrink-0 bg-(--surface-2)">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-(--primary)" aria-hidden="true" />
            <span className="text-xs font-bold text-(--foreground)">Live Incidents</span>
          </div>
          <div className="flex items-center gap-1.5">
            {criticalCount > 0 && (
              <m.span
                className="inline-flex items-center h-4 px-1.5 rounded-full bg-red-500 text-white text-[9px] font-bold font-mono"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                aria-label={`${criticalCount} critical`}
              >
                {criticalCount} CRIT
              </m.span>
            )}
            <span className="text-[10px] font-mono text-(--foreground-subtle)">
              {openCount} active
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-(--foreground-subtle)" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search incidents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-6 pr-2 py-1.5 text-[11px] bg-(--surface-1) border border-(--border) rounded-md outline-none focus:ring-1 focus:ring-(--primary-light) placeholder:text-(--foreground-subtle) text-(--foreground)"
            aria-label="Search incidents"
          />
        </div>

        {/* Category filter chips */}
        <div className="flex gap-1 flex-wrap">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={cn(
                'px-2 py-0.5 rounded text-[9px] font-semibold font-mono uppercase tracking-wide transition-colors border',
                filter === f.id
                  ? 'bg-(--primary) text-white border-(--primary)'
                  : 'bg-(--surface-1) text-(--foreground-subtle) hover:bg-(--surface-3) border-(--border)',
              )}
              aria-pressed={filter === f.id}
              aria-label={`Filter by ${f.label}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incident list */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1.5 bg-(--surface-1)">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Filter size={18} className="text-(--foreground-subtle) mb-2 opacity-40" />
              <p className="text-xs text-(--foreground-subtle)">No incidents match filters</p>
            </div>
          ) : (
            filtered.map((incident, idx) => {
              const isActive = incident.id === activeIncidentId;
              const severity = SEVERITY_COLORS[incident.severity] ?? SEVERITY_COLORS.low;

              return (
                <m.button
                  key={incident.id}
                  onClick={() => onIncidentClick(incident.id)}
                  className={cn(
                    'w-full text-left border rounded-md p-2.5 transition-all duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)',
                    isActive
                      ? 'bg-(--primary-muted) border-(--primary-light) ring-1 ring-(--primary-light)'
                      : `${severity.bg} hover:brightness-95`,
                  )}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  aria-label={`Incident: ${incident.title}. ${incident.severity} severity. ${incident.status}.`}
                  aria-pressed={isActive}
                >
                  <div className="flex items-start gap-2">
                    {/* Severity dot */}
                    <div className="flex flex-col items-center pt-0.5 gap-1 shrink-0">
                      <span
                        className={cn('w-2 h-2 rounded-full shrink-0', severity.dot)}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={cn('text-[10px] font-bold font-mono uppercase tracking-wide', severity.text)}>
                          {incident.severity}
                        </span>
                        <span className="text-[9px] font-mono text-(--foreground-subtle)">
                          {STATUS_LABEL[incident.status] ?? incident.status.toUpperCase()}
                        </span>
                      </div>

                      <p className={cn('text-[11px] font-semibold leading-tight truncate', isActive ? 'text-(--primary)' : 'text-(--foreground)')}>
                        {incident.title}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-0.5 text-[9px] text-(--foreground-subtle)">
                          <MapPin size={8} aria-hidden="true" />
                          <span className="truncate max-w-24">{incident.location.zone}</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-[9px] text-(--foreground-subtle)" suppressHydrationWarning>
                          <Clock size={8} aria-hidden="true" />
                          {timeAgo(incident.createdAt)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      size={12}
                      className={cn('shrink-0 mt-2', isActive ? 'text-(--primary)' : 'text-(--foreground-subtle)')}
                      aria-hidden="true"
                    />
                  </div>
                </m.button>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Show resolved toggle */}
      <div className="px-3 py-2 border-t border-(--border) shrink-0 bg-(--surface-2)">
        <button
          onClick={handleToggleResolved}
          className="w-full text-[10px] font-semibold text-(--foreground-subtle) hover:text-(--foreground) transition-colors text-center"
          aria-pressed={showResolved}
        >
          {showResolved ? 'Hide resolved incidents' : 'Show resolved incidents'}
        </button>
      </div>
    </div>
  );
}
