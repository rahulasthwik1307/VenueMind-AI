'use client';

import {
  Radar,
  Cpu,
  User,
  Shield,
  Activity,
  HeartHandshake,
  Bus,
  Terminal,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { TimelineEvent, TimelineEventType } from '@/types/incident';

interface IncidentTimelineProps {
  events: TimelineEvent[];
}

const EVENT_CONFIG: Record<
  TimelineEventType,
  { icon: React.ComponentType<{ size: number; className?: string }>; color: string; bg: string; border: string }
> = {
  detection: {
    icon: Radar,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
  },
  ai_analysis: {
    icon: Cpu,
    color: 'text-(--primary)',
    bg: 'bg-(--primary-light) dark:bg-green-950/40',
    border: 'border-green-200 dark:border-green-900',
  },
  operator_action: {
    icon: User,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
  },
  security: {
    icon: Shield,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-900',
  },
  medical: {
    icon: Activity,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
  },
  volunteer: {
    icon: HeartHandshake,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-900',
  },
  transport: {
    icon: Bus,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-900',
  },
  system: {
    icon: Terminal,
    color: 'text-gray-500',
    bg: 'bg-gray-50 dark:bg-gray-900/40',
    border: 'border-gray-200 dark:border-gray-800',
  },
  resolution: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-900',
  },
};

function formatEventTime(isoString: string) {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function IncidentTimeline({ events }: IncidentTimelineProps) {
  // Sort events chronologically (oldest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="relative pl-8 space-y-4">
      {sortedEvents.map((event, index) => {
        const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.system;
        const Icon = config.icon;
        const isLast = index === sortedEvents.length - 1;

        return (
          <div key={event.id} className="relative flex items-start gap-4">
            {/* Connector Line */}
            {!isLast && (
              <div
                className="absolute left-[-20px] top-[12px] bottom-[-28px] w-px bg-(--border) z-0"
                aria-hidden="true"
              />
            )}

            {/* Timeline Dot with Icon */}
            <div
              className={cn(
                'absolute -left-8 top-0 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 z-10',
                config.bg,
                config.border
              )}
              aria-hidden="true"
            >
              <Icon size={12} className={config.color} />
            </div>

            {/* Content Card */}
            <div className="flex-1 min-w-0 bg-(--surface-2) rounded-md p-3 border border-(--border)">
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-[11px] font-semibold text-(--foreground)">
                  {event.title}
                </h5>
                <span className="text-[9px] font-mono text-(--foreground-subtle) shrink-0 bg-(--surface-1) px-1 py-0.2 rounded border border-(--border)" suppressHydrationWarning>
                  {formatEventTime(event.timestamp)}
                </span>
              </div>
              <p className="text-[10px] text-(--foreground-muted) mt-1 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}

      {sortedEvents.length === 0 && (
        <div className="text-center py-4 text-xs text-(--foreground-subtle) italic">
          No history recorded for this incident.
        </div>
      )}
    </div>
  );
}
