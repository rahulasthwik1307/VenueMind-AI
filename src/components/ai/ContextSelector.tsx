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
 * - Dropdowns use custom-styled select components with full keyboard support,
 *   ARIA attributes (role="listbox", role="option"), focus management, and escape-to-close.
 * - Visible focus states on all interactive elements
 * - aria-label on each control
 */

import { KeyboardEvent, useState, useRef, useEffect } from 'react';
import { MapPin, AlertCircle, LayoutGrid, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIncidentStore } from '@/store/modules/incident';
import type { AssistantDomain } from '@/types/assistant';
import { AnimatePresence, m } from 'framer-motion';
import { useOutsideClick } from '@/hooks/useOutsideClick';

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

interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface CustomSelectProps {
  id: string;
  value: string;
  options: CustomSelectOption[];
  placeholder: string;
  onChange: (val: string) => void;
  ariaLabel: string;
  noOptionsText?: string;
}

function CustomSelect({ id, value, options, placeholder, onChange, ariaLabel, noOptionsText = 'No options available' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [dropdownPlacement, setDropdownPlacement] = useState<'below' | 'above'>('below');
  const [maxHeight, setMaxHeight] = useState<number>(240);

  const openDropdown = () => {
    setIsOpen(true);
    const initialIndex = options.findIndex((o) => o.value === value);
    setFocusedIndex(initialIndex >= 0 ? initialIndex : 0);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // Close when clicking outside the component
  useOutsideClick(containerRef, closeDropdown, isOpen);

  // Set keyboard focus to option elements
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Calculate viewport-relative spacing when dropdown is opened or viewport changes
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePositionAndHeight = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;

      // Prefer displaying below trigger unless space is tight and above has more space
      if (spaceBelow < 180 && spaceAbove > spaceBelow) {
        setDropdownPlacement('above');
        setMaxHeight(Math.max(120, Math.min(240, spaceAbove)));
      } else {
        setDropdownPlacement('below');
        setMaxHeight(Math.max(120, Math.min(240, spaceBelow)));
      }
    };

    updatePositionAndHeight();
    window.addEventListener('resize', updatePositionAndHeight);
    window.addEventListener('scroll', updatePositionAndHeight, true);
    return () => {
      window.removeEventListener('resize', updatePositionAndHeight);
      window.removeEventListener('scroll', updatePositionAndHeight, true);
    };
  }, [isOpen]);

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDropdown();
    }
  };

  const handleOptionKeyDown = (e: KeyboardEvent<HTMLLIElement>, index: number) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(options[index].value);
      closeDropdown();
      triggerRef.current?.focus();
    }
  };

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (isOpen) {
            closeDropdown();
          } else {
            openDropdown();
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(
          'w-full flex items-center justify-between text-xs bg-(--surface-1) border border-(--border) rounded-md px-3 py-2 text-left',
          'text-(--foreground) focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)',
          'cursor-pointer transition-colors hover:border-(--border-strong)'
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className={cn('text-(--foreground-muted) transition-transform shrink-0', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.ul
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: dropdownPlacement === 'above' ? -4 : 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropdownPlacement === 'above' ? -2 : 2, scale: 0.99 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 bg-(--surface-1) border border-(--border) rounded-md shadow-lg z-50 py-1 overflow-y-auto outline-none"
            style={{
              maxHeight: `${maxHeight}px`,
              bottom: dropdownPlacement === 'above' ? 'calc(100% + 4px)' : 'auto',
              top: dropdownPlacement === 'below' ? 'calc(100% + 4px)' : 'auto',
            }}
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-xs text-(--foreground-muted) italic">
                {noOptionsText}
              </li>
            ) : (
              options.map((opt, idx) => {
                const isSelected = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    ref={(el) => { optionRefs.current[idx] = el; }}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => handleOptionKeyDown(e, idx)}
                    onClick={() => {
                      onChange(opt.value);
                      closeDropdown();
                      triggerRef.current?.focus();
                    }}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 cursor-pointer text-xs transition-colors border-l-2 outline-none',
                      isSelected
                        ? 'bg-(--primary-muted) text-(--primary) font-semibold border-(--primary) hover:bg-(--primary-muted)/90 focus:bg-(--primary-muted)/90'
                        : 'border-transparent text-(--foreground-muted) hover:bg-(--surface-2) hover:text-(--foreground) focus:bg-(--surface-2) focus:text-(--foreground)'
                    )}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[9px] text-(--foreground-muted) font-mono truncate mt-0.5">{opt.sublabel}</span>
                      )}
                    </div>
                    {isSelected && <Check size={12} className="text-(--primary) shrink-0 ml-2" />}
                  </li>
                );
              })
            )}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

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

  const incidentOptions = openIncidents.map((inc) => ({
    value: inc.id,
    label: inc.title,
    sublabel: `[${inc.severity.toUpperCase()}] Zone: ${inc.location.zone}`,
  }));

  const zoneOptions = ZONE_OPTIONS.map((zone) => ({
    value: zone,
    label: zone,
  }));

  const domainOptions = DOMAIN_OPTIONS.map((dom) => ({
    value: dom.value,
    label: dom.label,
  }));

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

      {/* Context-specific Custom Dropdown */}
      {selectedMode === 'incident' && (
        <div className="space-y-1">
          <label htmlFor="incident-select" className="text-[10px] font-medium text-(--foreground-muted)">
            Select Incident
          </label>
          <CustomSelect
            id="incident-select"
            value={selectedIncidentId ?? ''}
            options={incidentOptions}
            placeholder="— Select an incident —"
            onChange={(val) => onIncidentChange(val || null)}
            ariaLabel="Select incident to analyze"
            noOptionsText="No open incidents"
          />
        </div>
      )}

      {selectedMode === 'zone' && (
        <div className="space-y-1">
          <label htmlFor="zone-select" className="text-[10px] font-medium text-(--foreground-muted)">
            Select Zone
          </label>
          <CustomSelect
            id="zone-select"
            value={selectedZoneId ?? ''}
            options={zoneOptions}
            placeholder="— Select a zone —"
            onChange={(val) => onZoneChange(val || null)}
            ariaLabel="Select stadium zone to analyze"
          />
        </div>
      )}

      {selectedMode === 'domain' && (
        <div className="space-y-1">
          <label htmlFor="domain-select" className="text-[10px] font-medium text-(--foreground-muted)">
            Select Domain
          </label>
          <CustomSelect
            id="domain-select"
            value={selectedDomain ?? ''}
            options={domainOptions}
            placeholder="— Select a domain —"
            onChange={(val) => onDomainChange((val as AssistantDomain) || null)}
            ariaLabel="Select operational domain to analyze"
          />
        </div>
      )}
    </fieldset>
  );
}
