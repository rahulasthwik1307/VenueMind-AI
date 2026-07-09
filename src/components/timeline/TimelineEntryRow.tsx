'use client';

import { ActivityItem } from '@/types/incident';
import { useIncidentStore } from '@/store/modules/incident';
import { cn } from '@/utils/cn';
import { Shield, Activity, Cloud, Bus, Cpu, HeartHandshake } from 'lucide-react';
import type { Severity } from '@/types/common';

interface TimelineEntryRowProps {
  activity: ActivityItem;
}

const getCategoryIcon = (actor: string, message: string) => {
  const a = actor.toLowerCase();
  const m = message.toLowerCase();
  if (a.includes('weather') || m.includes('weather') || m.includes('storm')) {
    return <Cloud className="text-sky-500 shrink-0" size={13} />;
  }
  if (a.includes('transit') || a.includes('transport') || m.includes('metro') || m.includes('bus')) {
    return <Bus className="text-amber-500 shrink-0" size={13} />;
  }
  if (a.includes('system') || a.includes('turnstile') || m.includes('ticketing') || m.includes('scada')) {
    return <Cpu className="text-gray-500 shrink-0" size={13} />;
  }
  if (a.includes('security') || m.includes('security') || m.includes('alert')) {
    return <Shield className="text-red-500 shrink-0" size={13} />;
  }
  if (a.includes('medical') || m.includes('medical')) {
    return <HeartHandshake className="text-rose-500 shrink-0" size={13} />;
  }
  return <Activity className="text-blue-500 shrink-0" size={13} />;
};

const getSeverityStyles = (severity?: Severity) => {
  switch (severity) {
    case 'critical':
      return 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400';
    case 'high':
      return 'border-orange-500 bg-orange-50 dark:bg-orange-950/15 text-orange-700 dark:text-orange-400';
    case 'medium':
      return 'border-amber-500 bg-amber-50 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400';
    case 'low':
      return 'border-blue-500 bg-blue-50 dark:bg-blue-950/10 text-blue-700 dark:text-blue-400';
    default:
      return 'border-(--border) bg-(--surface-1) text-(--foreground)';
  }
};

export function TimelineEntryRow({ activity }: TimelineEntryRowProps) {
  const setActiveIncidentId = useIncidentStore((state) => state.setActiveIncidentId);
  const isClickable = !!activity.incidentId;

  const handleClick = () => {
    if (isClickable && activity.incidentId) {
      setActiveIncidentId(activity.incidentId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setActiveIncidentId(activity.incidentId!);
    }
  };

  const formattedTime = new Date(activity.time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <li
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : 'listitem'}
      aria-label={`${activity.actor}: ${activity.message} at ${formattedTime}`}
      className={cn(
        'group flex items-start gap-4 px-4 py-3 border-l-2 text-xs transition-all duration-150',
        getSeverityStyles(activity.severity),
        isClickable
          ? 'cursor-pointer hover:bg-(--surface-2) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)'
          : ''
      )}
    >
      <div className="shrink-0 pt-0.5" aria-hidden="true">
        {getCategoryIcon(activity.actor, activity.message)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="font-semibold text-(--foreground)">
            {activity.message}
          </span>
          <span className="text-[10px] font-mono text-(--foreground-subtle) group-hover:text-(--foreground-muted) transition-colors">
            {formattedTime}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] font-bold font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-(--surface-2) text-(--foreground-muted)">
            {activity.actor}
          </span>
          {activity.severity && (
            <span className={cn(
              'text-[8px] font-bold font-mono uppercase px-1 rounded',
              activity.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
              activity.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
              activity.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' :
              'bg-blue-500/10 text-blue-500'
            )}>
              {activity.severity}
            </span>
          )}
          {isClickable && (
            <span className="text-[9px] font-semibold text-(--primary) underline group-hover:text-(--primary-hover)">
              View Incident Details
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
