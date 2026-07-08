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
import type { IncidentFilters } from '@/utils/incidentTableUtils';
import type { Severity, IncidentStatus } from '@/types/common';

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

const DEFAULT_FILTERS: IncidentFilters = {
  severity: 'all',
  category: 'all',
  status: 'all',
  zone: 'all',
};

export default function IncidentsPage() {
  const { incidents, searchQuery, setSearchQuery, setActiveIncidentId } =
    useIncidentStore();

  const [filters, setFilters] = useState<IncidentFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Loading simulation (SimulationService starts up async)
  const isLoading = incidents.length === 0 && !searchQuery;

  const hasActiveFilters =
    filters.severity !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.zone !== 'all' ||
    searchQuery.trim().length > 0;

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
      <div className="space-y-(--card-gap) animate-fade-in pb-10">
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
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
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

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md border transition-all cursor-pointer',
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
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-(--border) text-(--foreground-muted) hover:text-(--foreground) hover:border-(--border-strong) transition-all cursor-pointer"
                aria-label="Clear all filters"
              >
                <X size={11} />
                Clear
              </button>
            )}
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
                    value={filters.severity}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, severity: e.target.value as Severity | 'all' }))
                    }
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
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, status: e.target.value as IncidentStatus | 'all' }))
                    }
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
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        category: e.target.value as typeof filters.category,
                      }))
                    }
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
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-(--card-gap)">
          {/* Left: Incident Table */}
          <div>
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
