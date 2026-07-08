/**
 * incidentTableUtils.ts — Pure helper functions for IncidentTable
 *
 * All functions are pure (no side effects, deterministic output) and
 * require no React dependency, making them directly unit-testable.
 */

import type { Incident } from '@/types/incident';
import type { Severity, IncidentStatus } from '@/types/common';

// ─── Sort ─────────────────────────────────────────────────────────────────────

export type IncidentSortKey = 'time' | 'severity' | 'status';
export type SortDirection = 'asc' | 'desc';

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const STATUS_WEIGHT: Record<IncidentStatus, number> = {
  open: 4,
  investigating: 3,
  mitigated: 2,
  resolved: 1,
};

/**
 * Returns a new sorted array of incidents without mutating the input.
 * @pure
 */
export function sortIncidents(
  incidents: Incident[],
  sortKey: IncidentSortKey,
  sortDir: SortDirection
): Incident[] {
  const multiplier = sortDir === 'asc' ? 1 : -1;

  return [...incidents].sort((a, b) => {
    switch (sortKey) {
      case 'severity':
        return (SEVERITY_WEIGHT[a.severity] - SEVERITY_WEIGHT[b.severity]) * multiplier;
      case 'status':
        return (STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status]) * multiplier;
      case 'time':
      default:
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier
        );
    }
  });
}

// ─── Filter ───────────────────────────────────────────────────────────────────

export interface IncidentFilters {
  severity: Severity | 'all';
  category: Incident['category'] | 'all';
  status: IncidentStatus | 'all';
  zone: string | 'all';
}

export const DEFAULT_FILTERS: IncidentFilters = {
  severity: 'all',
  category: 'all',
  status: 'all',
  zone: 'all',
};

/**
 * Returns filtered incidents based on the provided filter criteria and search query.
 * Search matches title, zone, description, and category (case-insensitive).
 * @pure
 */
export function filterIncidents(
  incidents: Incident[],
  filters: IncidentFilters,
  searchQuery: string
): Incident[] {
  const q = searchQuery.trim().toLowerCase();

  return incidents.filter((incident) => {
    if (filters.severity !== 'all' && incident.severity !== filters.severity) return false;
    if (filters.category !== 'all' && incident.category !== filters.category) return false;
    if (filters.status !== 'all' && incident.status !== filters.status) return false;
    if (filters.zone !== 'all' && !incident.location.zone.toLowerCase().includes(filters.zone.toLowerCase()))
      return false;

    if (q) {
      const searchable = [
        incident.title,
        incident.location.zone,
        incident.description,
        incident.category,
        incident.assignedTeam ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    return true;
  });
}
