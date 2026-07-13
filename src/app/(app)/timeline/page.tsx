'use client';

/**
 * /timeline — Global Chronological Operations Log
 *
 * Full historic read-only operations log grouped by match phase.
 * Features:
 * - Activity Density Overview Chart
 * - Unified filter bar (severity, category) matching Live Incidents UX pattern
 * - Grouping by exact Match Phase (Pre-Match, First Half, Halftime, Second Half, Post-Match)
 * - Clickable incident-related entries opening IncidentDrawer
 * - Keyboard navigation (visible focus, Enter/Space activation)
 * - Empty state handling
 */

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Filter, X, Search, Clock, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIncidentStore } from '@/store/modules/incident';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ActivityDensityChart } from '@/components/timeline/ActivityDensityChart';
import { TimelinePhaseGroup } from '@/components/timeline/TimelinePhaseGroup';
import type { Severity } from '@/types/common';
import type { ActivityItem } from '@/types/incident';

const SEVERITY_OPTIONS: Array<{ value: Severity | 'all'; label: string }> = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SOURCE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Sources' },
  { value: 'ops', label: 'Operations Center / Ops Manager' },
  { value: 'security', label: 'Security AI' },
  { value: 'medical', label: 'Medical Lead / Unit' },
  { value: 'transport', label: 'GPS Transit / Transport' },
  { value: 'system', label: 'Turnstiles / System' },
  { value: 'weather', label: 'Weather Station' },
];

interface TimelineFilters {
  severities: Severity[];
  sources: string[];
  searchQuery: string;
}

const DEFAULT_FILTERS: TimelineFilters = {
  severities: [],
  sources: [],
  searchQuery: '',
};

const TIMELINE_PHASES = ['pre-match', 'first-half', 'halftime', 'second-half', 'post-match'];

function matchesActorSource(activity: ActivityItem, sources: string[]): boolean {
  if (sources.length === 0) return true;
  const actor = activity.actor.toLowerCase();
  const msg = activity.message.toLowerCase();
  
  return sources.some((src) => {
    switch (src) {
      case 'ops':
        return actor.includes('ops') || actor.includes('operations');
      case 'security':
        return actor.includes('security');
      case 'medical':
        return actor.includes('medical') || msg.includes('medical');
      case 'transport':
        return actor.includes('transit') || actor.includes('transport') || actor.includes('gps');
      case 'system':
        return actor.includes('system') || actor.includes('turnstile');
      case 'weather':
        return actor.includes('weather');
      default:
        return false;
    }
  });
}

export default function TimelinePage() {
  const activities = useIncidentStore((state) => state.activities);
  const [filters, setFilters] = useState<TimelineFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const handleToggleQuickFilter = useCallback((pill: string) => {
    setFilters((prev) => {
      let severities = [...prev.severities];
      let sources = [...prev.sources];

      if (pill === 'critical') {
        if (severities.includes('critical')) {
          severities = [];
        } else {
          severities = ['critical'];
        }
      } else {
        if (sources.includes(pill)) {
          sources = [];
        } else {
          sources = [pill];
        }
      }

      return {
        ...prev,
        severities,
        sources,
      };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.severities.length > 0 ||
    filters.sources.length > 0 ||
    filters.searchQuery.trim().length > 0;

  // Filter and group activities by match phase
  const { filteredActivities, activitiesByPhase } = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    const filtered = activities.filter((act) => {
      // 1. Severity filter
      if (filters.severities.length > 0) {
        if (!act.severity) return false;
        const isCriticalOrHigh = act.severity === 'critical' || act.severity === 'high';
        const hasCriticalFilter = filters.severities.includes('critical');
        const hasOtherFilters = filters.severities.some(s => s !== 'critical' && s === act.severity);
        if (hasCriticalFilter && isCriticalOrHigh) {
          // match
        } else if (hasOtherFilters) {
          // match
        } else {
          return false;
        }
      }
      // 2. Source filter
      if (!matchesActorSource(act, filters.sources)) {
        return false;
      }
      // 3. Search query
      if (q) {
        const searchable = [act.message, act.actor, act.severity ?? ''].join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });

    const byPhase = TIMELINE_PHASES.reduce((acc, phase) => {
      acc[phase] = filtered.filter((act) => {
        const actPhase = act.matchPhase || 'pre-match';
        return actPhase === phase;
      });
      return acc;
    }, {} as Record<string, ActivityItem[]>);

    // Group any remaining activities that don't match standard phases into "pre-match"
    const generalActivities = filtered.filter(
      (act) => !TIMELINE_PHASES.includes(act.matchPhase || '')
    );
    if (generalActivities.length > 0) {
      byPhase['pre-match'] = [...byPhase['pre-match'], ...generalActivities];
    }

    return { filteredActivities: filtered, activitiesByPhase: byPhase };
  }, [activities, filters]);

  const isEmpty = filteredActivities.length === 0;

  return (
    <PageContainer>
      <div className="space-y-(--card-gap) animate-fade-in pb-10">
        {/* Page Header */}
        <div className="bg-(--surface-1) border border-(--border) rounded-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <SectionHeader
              title="Global Operations Chronological Log"
              description="Full historic log of detections, dispatches, settings toggles, and resolutions across the entire tournament session"
              className="mb-0!"
            />
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-indicator" aria-hidden="true" />
              <span className="text-[10px] font-mono text-(--foreground-subtle) uppercase tracking-wide">Connected</span>
              <span className="text-[10px] font-mono font-bold text-(--foreground-subtle) ml-2">
                {activities.length} total events
              </span>
            </div>
          </div>
        </div>

        {/* Activity Density Chart */}
        {activities.length > 0 && <ActivityDensityChart activities={activities} />}

        {/* Search + Filter Bar */}
        <div className="bg-(--surface-1) border border-(--border) rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
            {/* Left side: Search input (mobile) and Quick Filter Pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
              {/* Search input (visible only on mobile) */}
              <div className="relative flex-1 sm:hidden">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-(--foreground-subtle)"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
                  placeholder="Search log entries…"
                  className={cn(
                    'w-full pl-9 pr-4 py-2 text-xs rounded-md border bg-(--surface-2)',
                    'border-(--border) text-(--foreground) placeholder:text-(--foreground-subtle)',
                    'focus:outline-none focus:ring-1 focus:ring-(--primary) focus:border-(--primary)',
                    'transition-colors'
                  )}
                  aria-label="Search log entries"
                />
                {filters.searchQuery && (
                  <button
                    onClick={() => setFilters((f) => ({ ...f, searchQuery: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-(--foreground-subtle) hover:text-(--foreground) cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Inline Quick-Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Quick filters (combined with OR logic)">
                {/* Critical Severity Pill */}
                <button
                  type="button"
                  onClick={() => handleToggleQuickFilter('critical')}
                  aria-pressed={filters.severities.includes('critical')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1',
                    filters.severities.includes('critical')
                      ? 'bg-red-600 border-red-600 text-white dark:bg-red-900/60 dark:border-red-900/60'
                      : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                  )}
                  aria-label="Filter by critical severity"
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', filters.severities.includes('critical') ? 'bg-white animate-pulse' : 'bg-red-500')} aria-hidden="true" />
                  Critical
                </button>

                {/* Security Pill */}
                <button
                  type="button"
                  onClick={() => handleToggleQuickFilter('security')}
                  aria-pressed={filters.sources.includes('security')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1',
                    filters.sources.includes('security')
                      ? 'bg-(--primary) border-(--primary) text-white'
                      : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                  )}
                  aria-label="Filter by Security AI source"
                >
                  <Shield size={10} className="shrink-0" />
                  Security AI
                </button>

                {/* Medical Pill */}
                <button
                  type="button"
                  onClick={() => handleToggleQuickFilter('medical')}
                  aria-pressed={filters.sources.includes('medical')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1',
                    filters.sources.includes('medical')
                      ? 'bg-(--primary) border-(--primary) text-white'
                      : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                  )}
                  aria-label="Filter by Medical source"
                >
                  Medical
                </button>

                {/* Transport Pill */}
                <button
                  type="button"
                  onClick={() => handleToggleQuickFilter('transport')}
                  aria-pressed={filters.sources.includes('transport')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1',
                    filters.sources.includes('transport')
                      ? 'bg-(--primary) border-(--primary) text-white'
                      : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                  )}
                  aria-label="Filter by transport source"
                >
                  Transport
                </button>

                {/* System Pill */}
                <button
                  type="button"
                  onClick={() => handleToggleQuickFilter('system')}
                  aria-pressed={filters.sources.includes('system')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1',
                    filters.sources.includes('system')
                      ? 'bg-(--primary) border-(--primary) text-white'
                      : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                  )}
                  aria-label="Filter by turnstiles and system health source"
                >
                  Systems
                </button>
              </div>
            </div>

            {/* Right side: Filter dropdown toggle and Clear buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1',
                  showFilters || hasActiveFilters
                    ? 'bg-(--primary) text-white border-(--primary)'
                    : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                )}
                aria-expanded={showFilters}
                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter size={12} />
                Filters
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80" aria-hidden="true" />
                )}
              </button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-(--border) text-(--foreground-muted) hover:text-(--foreground) hover:border-(--border-strong) transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1"
                  aria-label="Clear all filters"
                >
                  <X size={11} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter dropdowns */}
          <AnimatePresence>
            {showFilters && (
              <div className="mt-3 pt-3 border-t border-(--border) grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Severity filter */}
                <div>
                  <label
                    htmlFor="filter-severity"
                    className="text-[9px] font-bold uppercase tracking-wide text-(--foreground-subtle) block mb-1"
                  >
                    Severity
                  </label>
                  <select
                    id="filter-severity"
                    value={filters.severities.length === 1 ? filters.severities[0] : 'all'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters((f) => ({
                        ...f,
                        severities: val === 'all' ? [] : [val as Severity],
                      }));
                    }}
                    className="w-full text-[10px] px-2 py-1.5 rounded border bg-(--surface-2) border-(--border) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--primary) cursor-pointer"
                  >
                    {SEVERITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source filter */}
                <div>
                  <label
                    htmlFor="filter-source"
                    className="text-[9px] font-bold uppercase tracking-wide text-(--foreground-subtle) block mb-1"
                  >
                    Source / Actor
                  </label>
                  <select
                    id="filter-source"
                    value={filters.sources.length === 1 ? filters.sources[0] : 'all'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters((f) => ({
                        ...f,
                        sources: val === 'all' ? [] : [val],
                      }));
                    }}
                    className="w-full text-[10px] px-2 py-1.5 rounded border bg-(--surface-2) border-(--border) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--primary) cursor-pointer"
                  >
                    {SOURCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Timeline Log Feed */}
        <div className="space-y-6">
          {isEmpty ? (
            <EmptyState
              title="No operations activities logged"
              description={
                hasActiveFilters
                  ? 'No entries match your current search queries or filter selections.'
                  : 'Start match simulation to accumulate global operations records.'
              }
              icon={<Clock size={20} className="text-(--foreground-subtle)" />}
              action={
                hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-(--primary) text-white hover:bg-(--primary-hover) cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : undefined
              }
            />
          ) : (
            TIMELINE_PHASES.map((phase) => (
              <TimelinePhaseGroup
                key={phase}
                phase={phase}
                activities={activitiesByPhase[phase] || []}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border border-(--border) rounded-card px-5 py-3 flex justify-between text-[9px] font-mono text-(--foreground-subtle) bg-(--surface-1)">
          <span>HISTORICAL TIMELINE — COMPLETED RECORDS</span>
          <span>FIFA WORLD CUP 2026</span>
        </div>
      </div>
    </PageContainer>
  );
}
