'use client';

/**
 * /incidents — Live Incident Management Console
 *
 * Full-function incident operations page, distinct from the Dashboard's compact queue.
 * Features:
 * - Stats strip (total active, critical open, resolved today, avg response time)
 * - Sortable/filterable incident table with multi-select
 * - Bulk actions toolbar (resolve, assign, AI consolidated briefing)
 * - AI queue prioritization panel
 * - Incident drawer for full detail view (reuses existing IncidentDrawer)
 * - Loading, empty, and error states per DoD
 *
 * No modifications to Dashboard or any Stage 1-5 components.
 */

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Filter, X, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIncidentStore } from '@/store/modules/incident';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { IncidentStatsStrip } from '@/components/incident/IncidentStatsStrip';
import { IncidentTable } from '@/components/incident/IncidentTable';
import { IncidentBulkActions } from '@/components/incident/IncidentBulkActions';
import { IncidentQueueAI } from '@/components/incident/IncidentQueueAI';
import { DEFAULT_FILTERS } from '@/utils/incidentTableUtils';
import type { IncidentFilters } from '@/utils/incidentTableUtils';
import type { Severity, IncidentStatus } from '@/types/common';
import type { Incident } from '@/types/incident';

const SEVERITY_OPTIONS: Array<{ value: Severity | 'all'; label: string }> = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const STATUS_OPTIONS: Array<{ value: IncidentStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'mitigated', label: 'Mitigated' },
  { value: 'resolved', label: 'Resolved' },
];

const CATEGORY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Categories' },
  { value: 'crowd', label: 'Crowd' },
  { value: 'medical', label: 'Medical' },
  { value: 'security', label: 'Security' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'transport', label: 'Transport' },
  { value: 'weather', label: 'Weather' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'accessibility', label: 'Accessibility' },
];

export default function IncidentsPage() {
  const { incidents, searchQuery, setSearchQuery, setActiveIncidentId } =
    useIncidentStore();

  const [filters, setFilters] = useState<IncidentFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Loading simulation (SimulationService starts up async)
  const isLoading = incidents.length === 0 && !searchQuery;

  const hasActiveFilters =
    filters.severities.length > 0 ||
    filters.categories.length > 0 ||
    filters.statuses.length > 0 ||
    filters.zone !== 'all' ||
    filters.emergencyMode ||
    searchQuery.trim().length > 0;

  const handleToggleQuickFilter = useCallback((pill: string) => {
    setFilters((prev) => {
      let severities = [...prev.severities];
      let statuses = [...prev.statuses];
      let categories = [...prev.categories];
      let emergencyMode = prev.emergencyMode;

      switch (pill) {
        case 'critical':
          if (severities.includes('critical')) {
            severities = severities.filter((s) => s !== 'critical');
          } else {
            severities.push('critical');
            emergencyMode = false;
          }
          break;
        case 'open':
          if (statuses.includes('open')) {
            statuses = statuses.filter((s) => s !== 'open');
          } else {
            statuses.push('open');
          }
          break;
        case 'crowd':
          if (categories.includes('crowd')) {
            categories = categories.filter((c) => c !== 'crowd');
          } else {
            categories.push('crowd');
            emergencyMode = false;
          }
          break;
        case 'transport':
          if (categories.includes('transport')) {
            categories = categories.filter((c) => c !== 'transport');
          } else {
            categories.push('transport');
            emergencyMode = false;
          }
          break;
        case 'emergency':
          emergencyMode = !emergencyMode;
          break;
      }

      return {
        ...prev,
        severities,
        statuses,
        categories,
        emergencyMode,
      };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
  }, [setSearchQuery]);

  const handleOpenDetails = useCallback(
    (id: string) => {
      setActiveIncidentId(id);
    },
    [setActiveIncidentId]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return (
    <PageContainer>
      <div className="@container/page space-y-(--card-gap) animate-fade-in pb-10">
        <style>{`
          @container page (max-width: 1000px) {
            #live-incidents-grid {
              grid-template-columns: 1fr 280px !important;
            }
          }
        `}</style>
        {/* Page Header */}
        <div className="bg-(--surface-1) border border-(--border) rounded-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <SectionHeader
              title="Live Incident Management Console"
              description="Full incident queue with AI-assisted prioritization, bulk operations, and timeline history"
              className="mb-0!"
            />
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-indicator" aria-hidden="true" />
              <span className="text-[10px] font-mono text-(--foreground-subtle) uppercase tracking-wide">Live</span>
              <span className="text-[10px] font-mono font-bold text-(--foreground-subtle) ml-2">
                {incidents.length} total incidents
              </span>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        {!isLoading && <IncidentStatsStrip />}

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search incidents by title, zone, category, team…"
                  className={cn(
                    'w-full pl-9 pr-4 py-2 text-xs rounded-md border bg-(--surface-2)',
                    'border-(--border) text-(--foreground) placeholder:text-(--foreground-subtle)',
                    'focus:outline-none focus:ring-1 focus:ring-(--primary) focus:border-(--primary)',
                    'transition-colors'
                  )}
                  aria-label="Search incidents"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
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

                {/* Open Status Pill */}
                <button
                  type="button"
                  onClick={() => handleToggleQuickFilter('open')}
                  aria-pressed={filters.statuses.includes('open')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1',
                    filters.statuses.includes('open')
                      ? 'bg-(--primary) border-(--primary) text-white'
                      : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                  )}
                  aria-label="Filter by open status"
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', filters.statuses.includes('open') ? 'bg-white animate-pulse' : 'bg-amber-500')} aria-hidden="true" />
                  Open Queue
                </button>

                {/* Crowd Flow Pill */}
                <button
                  type="button"
                  onClick={() => handleToggleQuickFilter('crowd')}
                  aria-pressed={filters.categories.includes('crowd')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1',
                    filters.categories.includes('crowd')
                      ? 'bg-(--primary) border-(--primary) text-white'
                      : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                  )}
                  aria-label="Filter by crowd category"
                >
                  Crowd Flow
                </button>

                {/* Transport Pill */}
                <button
                  type="button"
                  onClick={() => handleToggleQuickFilter('transport')}
                  aria-pressed={filters.categories.includes('transport')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1',
                    filters.categories.includes('transport')
                      ? 'bg-(--primary) border-(--primary) text-white'
                      : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                  )}
                  aria-label="Filter by transport category"
                >
                  Transport
                </button>

                {/* Emergency Pill */}
                <button
                  type="button"
                  onClick={() => handleToggleQuickFilter('emergency')}
                  aria-pressed={filters.emergencyMode}
                  className={cn(
                    'px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1',
                    filters.emergencyMode
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                  )}
                  aria-label="Filter by emergency criteria (critical severity or security/medical/weather categories)"
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', filters.emergencyMode ? 'bg-white animate-pulse' : 'bg-red-500')} aria-hidden="true" />
                  Emergency
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
              <div className="mt-3 pt-3 border-t border-(--border) grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                        emergencyMode: false,
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

                {/* Status filter */}
                <div>
                  <label
                    htmlFor="filter-status"
                    className="text-[9px] font-bold uppercase tracking-wide text-(--foreground-subtle) block mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="filter-status"
                    value={filters.statuses.length === 1 ? filters.statuses[0] : 'all'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters((f) => ({
                        ...f,
                        statuses: val === 'all' ? [] : [val as IncidentStatus],
                      }));
                    }}
                    className="w-full text-[10px] px-2 py-1.5 rounded border bg-(--surface-2) border-(--border) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--primary) cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category filter */}
                <div>
                  <label
                    htmlFor="filter-category"
                    className="text-[9px] font-bold uppercase tracking-wide text-(--foreground-subtle) block mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="filter-category"
                    value={filters.categories.length === 1 ? filters.categories[0] : 'all'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters((f) => ({
                        ...f,
                        categories: val === 'all' ? [] : [val as Incident['category']],
                        emergencyMode: false,
                      }));
                    }}
                    className="w-full text-[10px] px-2 py-1.5 rounded border bg-(--surface-2) border-(--border) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--primary) cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zone search */}
                <div>
                  <label
                    htmlFor="filter-zone"
                    className="text-[9px] font-bold uppercase tracking-wide text-(--foreground-subtle) block mb-1"
                  >
                    Zone
                  </label>
                  <input
                    id="filter-zone"
                    type="text"
                    value={filters.zone === 'all' ? '' : filters.zone}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        zone: e.target.value.trim() || 'all',
                      }))
                    }
                    placeholder="e.g. Gate 7…"
                    className="w-full text-[10px] px-2 py-1.5 rounded border bg-(--surface-2) border-(--border) text-(--foreground) placeholder:text-(--foreground-subtle) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                    aria-label="Filter by zone name"
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions Toolbar (conditionally shown) */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <IncidentBulkActions
              selectedIds={selectedIds}
              onClearSelection={handleClearSelection}
            />
          )}
        </AnimatePresence>

        {/* Main content grid */}
        <div id="live-incidents-grid" className="grid grid-cols-1 min-[1440px]:grid-cols-[1fr_360px] gap-(--card-gap) min-w-0 w-full">
          {/* Left: Incident Table */}
          <div className="min-w-0">
            {isLoading ? (
              <LoadingState label="Loading incident queue…" />
            ) : (
              <IncidentTable
                incidents={incidents}
                filters={filters}
                searchQuery={searchQuery}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onOpenDetails={handleOpenDetails}
              />
            )}
          </div>

          {/* Right: AI Panel */}
          <IncidentQueueAI />
        </div>

        {/* Footer */}
        <div className="border border-(--border) rounded-card px-5 py-3 flex justify-between text-[9px] font-mono text-(--foreground-subtle) bg-(--surface-1)">
          <span>INCIDENT CONSOLE — LIVE</span>
          <span>FIFA WORLD CUP 2026</span>
        </div>
      </div>
    </PageContainer>
  );
}
