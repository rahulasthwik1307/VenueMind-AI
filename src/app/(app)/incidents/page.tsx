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
 * - Incident drawer for full detail view (uses existing IncidentDrawer)
 * - Loading, empty, and error states per DoD
 *
 * No modifications to Dashboard or any Stage 1-5 components.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useIncidentStore } from '@/store/modules/incident';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { IncidentStatsStrip } from '@/components/incident/IncidentStatsStrip';
import { IncidentTable } from '@/components/incident/IncidentTable';
import { IncidentBulkActions } from '@/components/incident/IncidentBulkActions';
import { IncidentQueueAI } from '@/components/incident/IncidentQueueAI';
import { IncidentFilterBar } from '@/components/incident/IncidentFilterBar';
import { DEFAULT_FILTERS } from '@/utils/incidentTableUtils';
import type { IncidentFilters } from '@/utils/incidentTableUtils';

export default function IncidentsPage() {
  const { incidents, searchQuery, setSearchQuery, setActiveIncidentId } =
    useIncidentStore();

  const [filters, setFilters] = useState<IncidentFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const aiCardRef = useRef<HTMLDivElement>(null);
  const [aiCardHeight, setAiCardHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = aiCardRef.current;
    if (!el) return;

    const updateHeight = () => {
      setAiCardHeight(el.offsetHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

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
        <IncidentFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          handleToggleQuickFilter={handleToggleQuickFilter}
          handleClearFilters={handleClearFilters}
        />

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
                cardHeight={aiCardHeight ?? undefined}
              />
            )}
          </div>

          {/* Right: AI Panel */}
          <div ref={aiCardRef} className="h-fit">
            <IncidentQueueAI />
          </div>
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
