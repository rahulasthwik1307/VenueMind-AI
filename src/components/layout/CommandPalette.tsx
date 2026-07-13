'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, AlertTriangle, Brain, Map, Users, Bus, ShieldAlert, HelpingHand, Clock, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useIncidentStore } from '@/store/modules/incident';
import { NAV_GROUPS } from '@/constants/navigation';

import { CommandSearch } from './command/CommandSearch';
import { CommandResults } from './command/CommandResults';
import { CommandHints } from './command/CommandHints';
import type { NavResult, IncidentResult, CommandResult } from './command/CommandItem';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const incidents = useIncidentStore((state) => state.incidents);
  const setActiveIncidentId = useIncidentStore((state) => state.setActiveIncidentId);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
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
      .slice(0, 8)
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

  // ─── Activate a result ───────────────────────────────────────────────────
  const activateResult = useCallback(
    (result: CommandResult) => {
      onClose();
      if (result.kind === 'nav') {
        router.push(result.href);
      } else {
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
            <CommandSearch
              inputRef={inputRef}
              query={query}
              onChange={(val) => {
                setQuery(val);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              onClose={onClose}
              hasResults={results.length > 0}
              activeId={results[activeIndex] ? `cmd-result-${results[activeIndex].id}` : undefined}
            />

            <CommandResults
              results={results}
              activeIndex={activeIndex}
              query={query}
              onSelectResult={activateResult}
              onHoverResult={setActiveIndex}
            />

            <CommandHints />
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
