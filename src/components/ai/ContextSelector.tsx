'use client';

/**
 * ContextSelector — Structured Mode Context Picker
 *
 * Allows the operator to select an analysis context:
 * - An active incident from the incident store
 * - A stadium zone (by ID)
 * - An operational domain (crowd / transport / emergency / accessibility)
 *
 * Accessibility:
 * - Segmented control uses role="radiogroup" + role="radio" pattern
 * - Arrow-key navigation between segment options
 * - Dropdowns/selects use native <select> for full keyboard support
 * - Visible focus states on all interactive elements
 * - aria-label on each control
 */

import { KeyboardEvent } from 'react';
import { MapPin, AlertCircle, LayoutGrid } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIncidentStore } from '@/store/modules/incident';
import type { AssistantDomain } from '@/types/assistant';

export type StructuredMode = 'incident' | 'zone' | 'domain';

interface ContextSelectorProps {
  selectedMode: StructuredMode;
  onModeChange: (mode: StructuredMode) => void;
  selectedIncidentId: string | null;
  onIncidentChange: (id: string | null) => void;
  selectedZoneId: string | null;
  onZoneChange: (id: string | null) => void;
  selectedDomain: AssistantDomain | null;
  onDomainChange: (domain: AssistantDomain | null) => void;
}

const SEGMENT_OPTIONS: { value: StructuredMode; label: string; icon: React.ReactNode }[] = [
  { value: 'incident', label: 'Incident', icon: <AlertCircle size={12} aria-hidden="true" /> },
  { value: 'zone', label: 'Zone', icon: <MapPin size={12} aria-hidden="true" /> },
  { value: 'domain', label: 'Domain', icon: <LayoutGrid size={12} aria-hidden="true" /> },
];

const DOMAIN_OPTIONS: { value: AssistantDomain; label: string }[] = [
  { value: 'crowd', label: 'Crowd Management' },
  { value: 'transport', label: 'Transport & Logistics' },
  { value: 'emergency', label: 'Emergency Response' },
  { value: 'accessibility', label: 'Accessibility Services' },
];

const ZONE_OPTIONS = [
  'Main Gate North', 'Main Gate South', 'Gate A', 'Gate B', 'Gate C', 'Gate D',
  'Sector North', 'Sector South', 'Sector East', 'Sector West',
  'VIP Lounge', 'Medical Bay', 'Operations Center', 'Parking Zone A', 'Parking Zone B',
];



export function ContextSelector({
  selectedMode,
  onModeChange,
  selectedIncidentId,
  onIncidentChange,
  selectedZoneId,
  onZoneChange,
  selectedDomain,
  onDomainChange,
}: ContextSelectorProps) {
  const incidents = useIncidentStore((s) => s.incidents);
  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  /** Arrow-key navigation for the segmented control */
  const handleSegmentKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (idx + 1) % SEGMENT_OPTIONS.length;
      onModeChange(SEGMENT_OPTIONS[next].value);
      (document.getElementById(`segment-${SEGMENT_OPTIONS[next].value}`) as HTMLButtonElement)?.focus();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (idx - 1 + SEGMENT_OPTIONS.length) % SEGMENT_OPTIONS.length;
      onModeChange(SEGMENT_OPTIONS[prev].value);
      (document.getElementById(`segment-${SEGMENT_OPTIONS[prev].value}`) as HTMLButtonElement)?.focus();
    }
  };

  const selectClass = cn(
    'w-full text-xs bg-(--surface-1) border border-(--border) rounded-md px-3 py-2',
    'text-(--foreground) focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)',
    'cursor-pointer transition-colors hover:border-(--border-strong)'
  );

  return (
    <fieldset className="space-y-3">
      <legend className="text-[10px] font-bold uppercase tracking-wide text-(--foreground-subtle) font-mono">
        Analysis Context
      </legend>

      {/* Segmented control — radiogroup pattern */}
      <div
        role="radiogroup"
        aria-label="Select analysis context type"
        className="flex rounded-md border border-(--border) bg-(--surface-2) p-0.5 gap-0.5"
      >
        {SEGMENT_OPTIONS.map(({ value, label, icon }, idx) => {
          const isSelected = selectedMode === value;
          return (
            <button
              key={value}
              id={`segment-${value}`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onModeChange(value)}
              onKeyDown={(e) => handleSegmentKeyDown(e, idx)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 py-1.5 px-2 rounded-sm text-[10px] font-semibold transition-all duration-150',
                isSelected
                  ? 'bg-(--surface-1) text-(--foreground) shadow-sm border border-(--border)'
                  : 'text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-3)'
              )}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </div>

      {/* Context-specific dropdown */}
      {selectedMode === 'incident' && (
        <div className="space-y-1">
          <label htmlFor="incident-select" className="text-[10px] font-medium text-(--foreground-muted)">
            Select Incident
          </label>
          <select
            id="incident-select"
            value={selectedIncidentId ?? ''}
            onChange={(e) => onIncidentChange(e.target.value || null)}
            className={selectClass}
            aria-label="Select incident to analyze"
          >
            <option value="">— Select an incident —</option>
            {openIncidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                [{inc.severity.toUpperCase()}] {inc.title} · {inc.location.zone}
              </option>
            ))}
            {openIncidents.length === 0 && (
              <option value="" disabled>
                No open incidents
              </option>
            )}
          </select>
        </div>
      )}

      {selectedMode === 'zone' && (
        <div className="space-y-1">
          <label htmlFor="zone-select" className="text-[10px] font-medium text-(--foreground-muted)">
            Select Zone
          </label>
          <select
            id="zone-select"
            value={selectedZoneId ?? ''}
            onChange={(e) => onZoneChange(e.target.value || null)}
            className={selectClass}
            aria-label="Select stadium zone to analyze"
          >
            <option value="">— Select a zone —</option>
            {ZONE_OPTIONS.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedMode === 'domain' && (
        <div className="space-y-1">
          <label htmlFor="domain-select" className="text-[10px] font-medium text-(--foreground-muted)">
            Select Domain
          </label>
          <select
            id="domain-select"
            value={selectedDomain ?? ''}
            onChange={(e) => onDomainChange((e.target.value as AssistantDomain) || null)}
            className={selectClass}
            aria-label="Select operational domain to analyze"
          >
            <option value="">— Select a domain —</option>
            {DOMAIN_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
    </fieldset>
  );
}
