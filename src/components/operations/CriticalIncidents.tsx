import { AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import type { Severity } from '@/types/common';

interface IncidentPlaceholder {
  id: string;
  title: string;
  location: string;
  time: string;
  severity: Severity;
}

const PLACEHOLDER_INCIDENTS: IncidentPlaceholder[] = [
  {
    id: 'inc-001',
    title: 'Crowd congestion at Gate 7',
    location: 'North Stand · Gate 7',
    time: '2 min ago',
    severity: 'high',
  },
  {
    id: 'inc-002',
    title: 'Medical assistance requested',
    location: 'Sector C · Row 14',
    time: '8 min ago',
    severity: 'medium',
  },
  {
    id: 'inc-003',
    title: 'Lost child reported',
    location: 'Fan Services Desk · East',
    time: '14 min ago',
    severity: 'medium',
  },
];

const SEVERITY_STYLES: Record<Severity, { dot: string; badge: string }> = {
  critical: {
    dot: 'bg-red-600',
    badge: 'text-red-700 bg-red-50 border-red-100',
  },
  high: {
    dot: 'bg-red-500',
    badge: 'text-red-700 bg-red-50 border-red-100',
  },
  medium: {
    dot: 'bg-yellow-500',
    badge: 'text-yellow-700 bg-yellow-50 border-yellow-100',
  },
  low: {
    dot: 'bg-blue-400',
    badge: 'text-blue-700 bg-blue-50 border-blue-100',
  },
};

function IncidentRow({ incident }: { incident: IncidentPlaceholder }) {
  const styles = SEVERITY_STYLES[incident.severity];

  return (
    <li
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-md',
        'border border-(--border) bg-(--surface-1)',
        'hover:border-(--border-strong) hover:shadow-(--shadow-sm)',
        'transition-all duration-150 cursor-default group'
      )}
      aria-label={`${incident.severity} severity incident: ${incident.title}`}
    >
      {/* Severity dot */}
      <span
        className={cn('w-2 h-2 rounded-full shrink-0 mt-px', styles.dot)}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-(--foreground) truncate leading-snug">
          {incident.title}
        </p>
        <p className="text-[10px] text-(--foreground-muted) mt-0.5 truncate">
          {incident.location} · {incident.time}
        </p>
      </div>

      {/* Severity badge */}
      <span
        className={cn(
          'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0',
          styles.badge
        )}
        aria-hidden="true"
      >
        {incident.severity}
      </span>

      <ChevronRight
        size={13}
        strokeWidth={1.75}
        className="text-(--foreground-subtle) shrink-0 group-hover:text-(--foreground-muted) transition-colors duration-150"
        aria-hidden="true"
      />
    </li>
  );
}

export function CriticalIncidents() {
  const isLoading = false;

  return (
    <section
      className={cn(
        'bg-(--surface-1) border border-(--border) rounded-card p-5'
      )}
      aria-label="Critical incidents"
    >
      <SectionHeader
        title="Critical Incidents"
        description="Requires immediate attention"
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

      {isLoading ? (
        <div className="space-y-2">
          <SkeletonCard lines={2} hasHeader={false} />
          <SkeletonCard lines={2} hasHeader={false} />
        </div>
      ) : (
        <ul className="space-y-2" role="list" aria-label="Active incidents list">
          {PLACEHOLDER_INCIDENTS.map((incident) => (
            <IncidentRow key={incident.id} incident={incident} />
          ))}
        </ul>
      )}

      <button
        className={cn(
          'mt-3 w-full flex items-center justify-center gap-1.5',
          'text-xs font-medium text-(--primary) hover:text-(--primary-hover)',
          'py-2 rounded-md hover:bg-(--primary-muted)',
          'transition-colors duration-150',
          'focus-visible:outline-(--focus-ring)'
        )}
        aria-label="View all incidents (coming in next stage)"
        aria-disabled="true"
      >
        <AlertTriangle size={12} strokeWidth={1.75} aria-hidden="true" />
        View all incidents
      </button>
    </section>
  );
}
