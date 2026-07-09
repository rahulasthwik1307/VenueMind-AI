'use client';

import {
  Shield,
  Activity,
  Users,
  Bus,
  Cloud,
  Building,
  Brain,
  CheckCircle,
  HelpCircle,
  Accessibility,
  HeartHandshake,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { useIncident } from '@/hooks/useIncident';
import type { Incident } from '@/types/incident';
import type { Severity } from '@/types/common';
import { m, AnimatePresence } from 'framer-motion';

export const SEVERITY_STYLES: Record<Severity, { dot: string; text: string; bg: string; border: string }> = {
  critical: {
    dot: 'bg-red-600',
    text: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-100 dark:border-red-900',
  },
  high: {
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50/50 dark:bg-red-950/10',
    border: 'border-red-100/80 dark:border-red-950',
  },
  medium: {
    dot: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/15',
    border: 'border-yellow-100 dark:border-yellow-900/50',
  },
  low: {
    dot: 'bg-blue-400',
    text: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50/50 dark:bg-blue-950/10',
    border: 'border-blue-100/50 dark:border-blue-900/30',
  },
};

export const CATEGORY_ICONS: Record<Incident['category'], React.ComponentType<{ size: number; className?: string }>> = {
  crowd: Users,
  medical: Activity,
  security: Shield,
  infrastructure: Building,
  transport: Bus,
  weather: Cloud,
  volunteer: HeartHandshake,
  accessibility: Accessibility,
};

export function getTimeAgo(dateString: string) {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export interface IncidentRowProps {
  incident: Incident;
  isSelected: boolean;
  onSelect: () => void;
}

export function IncidentRow({ incident, isSelected, onSelect }: IncidentRowProps) {
  const styles = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.low;
  const CategoryIcon = CATEGORY_ICONS[incident.category] || HelpCircle;
  const timeAgo = getTimeAgo(incident.createdAt);

  return (
    <m.li
      layoutId={`incident-${incident.id}`}
      onClick={onSelect}
      className={cn(
        'flex flex-col gap-2.5 px-4 py-3 rounded-md border text-left cursor-pointer transition-all duration-200 group relative',
        isSelected
          ? 'bg-(--surface-1) border-(--primary) shadow-(--shadow-md) ring-1 ring-(--primary)'
          : 'bg-(--surface-1) border-(--border) hover:border-(--border-strong) hover:bg-(--surface-2)'
      )}
      aria-label={`${incident.severity} severity ${incident.category} incident: ${incident.title}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Top row: Category, title, severity */}
      <div className="flex items-start gap-2.5 justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            'w-6 h-6 rounded flex items-center justify-center shrink-0 border transition-colors',
            isSelected 
              ? 'bg-(--primary-muted) text-(--primary) border-(--primary-light)' 
              : 'bg-(--surface-2) text-(--foreground-muted) border-(--border) group-hover:bg-(--surface-3)'
          )}>
            <CategoryIcon size={12} />
          </div>
          <span className="text-xs font-semibold text-(--foreground) truncate leading-tight">
            {incident.title}
          </span>
        </div>
        
        <span className={cn(
          'text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 font-mono tracking-wide',
          styles.bg,
          styles.text,
          styles.border
        )}>
          {incident.severity}
        </span>
      </div>

      {/* Middle details row: Location, time */}
      <div className="flex items-center justify-between text-[10px] text-(--foreground-subtle)">
        <span>{incident.location.zone}</span>
        <span className="font-mono" suppressHydrationWarning>{timeAgo}</span>
      </div>

      {/* Bottom meta row: Assigned team, status, AI confidence */}
      <div className="flex items-center justify-between border-t border-(--border) pt-2 mt-0.5">
        <div className="flex items-center gap-1.5 min-w-0 text-[9px] text-(--foreground-muted)">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-px bg-gray-400" />
          <span className="truncate">{incident.assignedTeam || 'Unassigned'}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {incident.aiConfidence && (
            <div className="flex items-center gap-0.5 text-[9px] text-(--primary) font-semibold font-mono bg-(--primary-light) dark:bg-green-950/20 px-1 py-0.2 rounded">
              <Brain size={8} />
              <span>{incident.aiConfidence}%</span>
            </div>
          )}
          <span className={cn(
            'text-[9px] font-bold px-1 rounded-sm uppercase tracking-wide',
            incident.status === 'open' && 'text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-400',
            incident.status === 'investigating' && 'text-yellow-700 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400',
            incident.status === 'resolved' && 'text-green-700 bg-green-50 dark:bg-green-950/20 dark:text-green-400'
          )}>
            {incident.status}
          </span>
        </div>
      </div>
    </m.li>
  );
}

export function CriticalIncidents({ className }: { className?: string }) {
  const {
    incidents,
    activeIncidentId,
    setActiveIncidentId,
    filter,
    setFilter,
    searchQuery,
  } = useIncident();

  const isLoading = false;

  // Filter incidents locally for rendering based on search and filter parameters
  const filteredIncidents = incidents.filter((inc) => {
    // Apply Category/Severity/Status Filter
    if (filter === 'critical') {
      if (inc.severity !== 'critical') return false;
    } else if (filter !== 'all') {
      if (inc.status !== filter) return false;
    }

    // Apply Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.location.zone.toLowerCase().includes(q) ||
        inc.category.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.severity.toLowerCase().includes(q) ||
        (inc.assignedTeam && inc.assignedTeam.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const filterOptions: { value: typeof filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'critical', label: 'Critical' },
    { value: 'open', label: 'Open' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'resolved', label: 'Resolved' },
  ];

  return (
    <section
      className={cn(
        'bg-(--surface-1) border border-(--border) rounded-card p-5 flex flex-col min-h-0',
        className
      )}
      aria-label="Incident queue"
    >
      <SectionHeader
        title="Incident Command Queue"
        description="Monitor, triage, and dispatch responses"
        action={
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full bg-red-500 live-indicator"
              aria-hidden="true"
            />
            <span className="text-[10px] text-(--foreground-subtle) font-medium">Live</span>
          </div>
        }
      />

      {/* Filter Queue Capsules */}
      <div className="flex items-center gap-1 pb-3 mb-3 border-b border-(--border) overflow-x-auto scrollbar-none shrink-0" role="tablist" aria-label="Incident filters">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            role="tab"
            aria-selected={filter === opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              'px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all duration-150 uppercase tracking-wide shrink-0',
              filter === opt.value
                ? 'bg-(--primary) text-white border-(--primary) shadow-(--shadow-xs)'
                : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:bg-(--surface-3) hover:border-(--border-strong)'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Queue Body */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-0.5">
        {isLoading ? (
          <div className="space-y-2">
            <SkeletonCard lines={2} hasHeader={false} />
            <SkeletonCard lines={2} hasHeader={false} />
            <SkeletonCard lines={2} hasHeader={false} />
          </div>
        ) : filteredIncidents.length > 0 ? (
          <ul className="space-y-2" role="list" aria-label="Active incidents list">
            <AnimatePresence initial={false}>
              {filteredIncidents.map((incident) => (
                <IncidentRow
                  key={incident.id}
                  incident={incident}
                  isSelected={activeIncidentId === incident.id}
                  onSelect={() => setActiveIncidentId(incident.id)}
                />
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <CheckCircle size={28} className="text-(--primary) opacity-50 mb-2" />
            <p className="text-xs font-semibold text-(--foreground)">Queue Clear</p>
            <p className="text-[10px] text-(--foreground-subtle) mt-0.5">
              No incidents match your current search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {searchQuery && (
        <div className="text-[10px] text-(--foreground-subtle) border-t border-(--border) pt-2 mt-2 font-mono">
          Search matches: <span className="font-semibold text-(--foreground)">{filteredIncidents.length}</span>
        </div>
      )}
    </section>
  );
}
