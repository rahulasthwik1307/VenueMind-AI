'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  AlertTriangle,
  LayoutDashboard,
  Brain,
  Map,
  Users,
  Bus,
  ShieldAlert,
  HelpingHand,
  Clock,
  Settings,
  X,
  ArrowRight,
} from 'lucide-react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useIncidentStore } from '@/store/modules/incident';
import { NAV_GROUPS } from '@/constants/navigation';
import type { LucideIcon } from 'lucide-react';
import type { Incident } from '@/types/incident';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Result types ─────────────────────────────────────────────────────────────

interface NavResult {
  kind: 'nav';
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group: string;
}

interface IncidentResult {
  kind: 'incident';
  id: string;
  label: string;
  subtitle: string;
  severity: Incident['severity'];
  status: Incident['status'];
}

type CommandResult = NavResult | IncidentResult;

// ─── Severity helpers ──────────────────────────────────────────────────────────

const SEVERITY_DOT: Record<Incident['severity'], string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-400',
  low: 'bg-emerald-500',
};

const SEVERITY_LABEL: Record<Incident['severity'], string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const STATUS_CLASSES: Record<Incident['status'], string> = {
  open: 'text-red-500',
  investigating: 'text-amber-500',
  mitigated: 'text-blue-500',
  resolved: 'text-emerald-500',
};

// ─── Nav icon map ──────────────────────────────────────────────────────────────
// Matches the icons defined in constants/navigation.ts
const NAV_ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  incidents: AlertTriangle,
  'ai-command': Brain,
  map: Map,
  crowd: Users,
  transport: Bus,
  emergency: ShieldAlert,
  accessibility: HelpingHand,
  timeline: Clock,
  settings: Settings,
};

/**
 * CommandPalette — Global keyboard-driven command & navigation overlay.
 *
 * Triggered by Ctrl/Cmd+K (wired in AppShell) or by clicking the header
 * search trigger button.
 *
 * Capabilities:
 * - Quick-navigate to any of the 10 app sections.
 * - Search and jump to any incident (opens IncidentDrawer).
 *
 * Accessibility:
 * - role="dialog", aria-modal="true"
 * - Search input: role="combobox", aria-expanded, aria-activedescendant
 * - Result rows: role="option" with unique IDs
 * - Full focus trap (only input + results are interactive)
 * - Escape closes; Arrow keys navigate; Enter activates
 * - Focus returns to the previously focused element on close
 */
export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const incidents = useIncidentStore((state) => state.incidents);
  const setActiveIncidentId = useIncidentStore((state) => state.setActiveIncidentId);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // ─── Build flat nav items list ───────────────────────────────────────────
  const navItems = useMemo<NavResult[]>(() =>
    NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        kind: 'nav' as const,
        id: `nav-${item.id}`,
        label: item.label,
        href: item.href,
        icon: NAV_ICON_MAP[item.id] ?? LayoutDashboard,
        group: group.label,
      }))
    ),
    [],
  );

  // ─── Filter results ──────────────────────────────────────────────────────
  const results = useMemo<CommandResult[]>(() => {
    if (!isOpen) return [];

    const q = query.trim().toLowerCase();

    const matchedNav: NavResult[] = q === ''
      ? navItems
      : navItems.filter((n) => n.label.toLowerCase().includes(q) || n.group.toLowerCase().includes(q));

    const matchedIncidents: IncidentResult[] = incidents
      .filter((inc) => {
        if (q === '') return true;
        return (
          inc.title.toLowerCase().includes(q) ||
          inc.description.toLowerCase().includes(q) ||
          inc.location.zone.toLowerCase().includes(q) ||
          inc.id.toLowerCase().includes(q) ||
          inc.category.toLowerCase().includes(q)
        );
      })
      .slice(0, 8) // cap at 8 incidents for readability
      .map((inc) => ({
        kind: 'incident' as const,
        id: `inc-${inc.id}`,
        label: inc.title,
        subtitle: `${inc.location.zone} · ${inc.category}`,
        severity: inc.severity,
        status: inc.status,
      }));

    return [...matchedNav, ...matchedIncidents];
  }, [isOpen, query, navItems, incidents]);

  // ─── Focus and mount management ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    const timer = setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
      clearTimeout(timer);
    };
  }, [isOpen]);

  // ─── Scroll active item into view ────────────────────────────────────────
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const activeEl = list.querySelector<HTMLLIElement>(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // ─── Activate a result ───────────────────────────────────────────────────
  const activateResult = useCallback(
    (result: CommandResult) => {
      onClose();
      if (result.kind === 'nav') {
        router.push(result.href);
      } else {
        // Open the IncidentDrawer for this incident
        setActiveIncidentId(result.id.replace('inc-', ''));
      }
    },
    [onClose, router, setActiveIncidentId],
  );

  // ─── Keyboard handler ────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(results.length, 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const result = results[activeIndex];
        if (result) activateResult(result);
      }
    },
    [results, activeIndex, onClose, activateResult],
  );

  // ─── Section boundaries ──────────────────────────────────────────────────
  const firstIncidentIndex = results.findIndex((r) => r.kind === 'incident');
  const hasNav = results.some((r) => r.kind === 'nav');
  const hasIncidents = results.some((r) => r.kind === 'incident');

  // ─── Animation variants ──────────────────────────────────────────────────
  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
  const cardVariants = prefersReducedMotion
    ? { hidden: {}, visible: {}, exit: {} }
    : { hidden: { opacity: 0, scale: 0.97, y: -8 }, visible: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.97, y: -8 } };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="cmd-palette-backdrop"
          className="fixed inset-0 z-9999 flex items-start justify-center pt-[10vh] px-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          // Click outside to close
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          {/* Palette card */}
          <m.div
            key="cmd-palette-card"
            role="dialog"
            aria-modal="true"
            aria-label="Global command palette"
            className={cn(
              'relative z-10 w-full max-w-140',
              'bg-(--surface-1) border border-(--border-strong)',
              'rounded-card shadow-(--shadow-lg)',
              'flex flex-col overflow-hidden',
            )}
            variants={cardVariants}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {/* ── Search input ── */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-(--border)">
              <Search
                size={15}
                className="shrink-0 text-(--foreground-subtle)"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-autocomplete="list"
                aria-activedescendant={
                  results[activeIndex] ? `cmd-result-${results[activeIndex].id}` : undefined
                }
                aria-controls="cmd-palette-results"
                placeholder="Search sections or incidents…"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                className={cn(
                  'flex-1 text-sm text-(--foreground) placeholder:text-(--foreground-subtle)',
                  'bg-transparent outline-none border-none',
                )}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                onClick={onClose}
                className={cn(
                  'shrink-0 flex items-center justify-center w-6 h-6 rounded',
                  'text-(--foreground-subtle) hover:bg-(--surface-2) hover:text-(--foreground)',
                  'transition-colors duration-150',
                )}
                aria-label="Close command palette"
                tabIndex={-1}
              >
                <X size={13} aria-hidden="true" />
              </button>
            </div>

            {/* ── Results list ── */}
            <ul
              id="cmd-palette-results"
              ref={listRef}
              role="listbox"
              aria-label="Results"
              className="max-h-[min(420px,60vh)] overflow-y-auto py-2 px-2 space-y-0.5 custom-scrollbar-always"
            >
              {results.length === 0 && (
                <li className="py-10 text-center" role="status">
                  <p className="text-sm text-(--foreground-subtle)">No results for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-(--foreground-subtle)/60 mt-1">Try a section name or incident title</p>
                </li>
              )}

              {/* Navigate to — section header */}
              {hasNav && (
                <li
                  className="px-2 pt-1 pb-0.5"
                  role="presentation"
                  aria-hidden="true"
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest text-(--foreground-subtle)">
                    Navigate to
                  </span>
                </li>
              )}

              {/* Nav results */}
              {results.map((result, index) => {
                // Section divider between nav and incidents
                const showIncidentHeader = hasIncidents && result.kind === 'incident' && index === firstIncidentIndex;

                return (
                  <li
                    key={result.id}
                    id={`cmd-result-${result.id}`}
                    data-index={index}
                    role="option"
                    aria-selected={activeIndex === index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      activateResult(result);
                    }}
                    className={cn(
                      'cursor-pointer',
                    )}
                  >
                    {showIncidentHeader && (
                      <div className="px-2 pt-3 pb-0.5" aria-hidden="true">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-(--foreground-subtle)">
                          Incidents
                        </span>
                      </div>
                    )}

                    {result.kind === 'nav' ? (
                      <NavResultRow result={result} isActive={activeIndex === index} />
                    ) : (
                      <IncidentResultRow result={result} isActive={activeIndex === index} />
                    )}
                  </li>
                );
              })}
            </ul>

            {/* ── Footer hint bar ── */}
            <div
              className="flex items-center gap-4 px-4 py-2 border-t border-(--border) bg-(--surface-2)"
              aria-hidden="true"
            >
              <HintKey keys={['↑', '↓']} label="navigate" />
              <HintKey keys={['↵']} label="select" />
              <HintKey keys={['Esc']} label="close" />
              <div className="ml-auto flex items-center gap-1 text-(--foreground-subtle)">
                <span className="text-[9px] font-mono">⌘K</span>
                <span className="text-[9px] text-(--foreground-subtle)/60">to toggle</span>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function NavResultRow({ result, isActive }: { result: NavResult; isActive: boolean }) {
  const Icon = result.icon;
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors duration-100',
        isActive
          ? 'bg-(--primary-muted) text-(--primary)'
          : 'text-(--foreground-muted) hover:bg-(--surface-2)',
      )}
    >
      <div
        className={cn(
          'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
          isActive ? 'bg-(--primary)/15' : 'bg-(--surface-2)',
        )}
      >
        <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{result.label}</p>
        <p className="text-[9px] text-(--foreground-subtle) truncate">{result.group}</p>
      </div>
      <ArrowRight
        size={12}
        className={cn('shrink-0 opacity-0 transition-opacity', isActive && 'opacity-60')}
        aria-hidden="true"
      />
    </div>
  );
}

function IncidentResultRow({ result, isActive }: { result: IncidentResult; isActive: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors duration-100',
        isActive
          ? 'bg-(--primary-muted) text-(--primary)'
          : 'text-(--foreground-muted) hover:bg-(--surface-2)',
      )}
    >
      {/* Severity dot */}
      <div className="shrink-0 flex items-center justify-center w-7 h-7">
        <span
          className={cn('w-2 h-2 rounded-full shrink-0', SEVERITY_DOT[result.severity])}
          aria-label={SEVERITY_LABEL[result.severity]}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{result.label}</p>
        <p className="text-[9px] text-(--foreground-subtle) truncate">{result.subtitle}</p>
      </div>

      <span
        className={cn(
          'shrink-0 text-[9px] font-semibold font-mono uppercase',
          STATUS_CLASSES[result.status],
        )}
      >
        {result.status}
      </span>
    </div>
  );
}

function HintKey({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded bg-(--surface-3) border border-(--border-strong)/40 text-[9px] font-mono font-medium text-(--foreground-subtle)"
        >
          {k}
        </kbd>
      ))}
      <span className="text-[9px] text-(--foreground-subtle)/60 ml-0.5">{label}</span>
    </div>
  );
}
