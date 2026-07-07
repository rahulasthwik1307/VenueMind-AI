import { cn } from '@/utils/cn';
import { SectionHeader } from '@/components/shared/SectionHeader';
import type { Severity } from '@/types/common';

interface ActivityItem {
  id: string;
  message: string;
  actor: string;
  time: string;
  severity?: Severity;
}

const PLACEHOLDER_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-001',
    message: 'Security team deployed to Gate 7',
    actor: 'Ops Manager',
    time: '3 min ago',
    severity: 'high',
  },
  {
    id: 'act-002',
    message: 'Medical unit 3 responded to sector C',
    actor: 'Medical Lead',
    time: '9 min ago',
    severity: 'medium',
  },
  {
    id: 'act-003',
    message: 'Lost child located — reunited with family',
    actor: 'Volunteer Team B',
    time: '20 min ago',
    severity: 'low',
  },
  {
    id: 'act-004',
    message: 'Transport Line 2 delay resolved',
    actor: 'Transport Coordinator',
    time: '32 min ago',
    severity: 'low',
  },
  {
    id: 'act-005',
    message: 'Sector D gates opened — capacity balanced',
    actor: 'Operations AI',
    time: '45 min ago',
  },
];

const SEVERITY_DOT: Record<Severity, string> = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export function RecentActivity() {
  return (
    <section
      className={cn(
        'bg-(--surface-1) border border-(--border) rounded-card p-5'
      )}
      aria-label="Recent activity log"
    >
      <SectionHeader
        title="Recent Activity"
        description="Last 60 minutes"
      />

      <ol className="relative space-y-0" aria-label="Activity timeline">
        {PLACEHOLDER_ACTIVITY.map((item, index) => (
          <li
            key={item.id}
            className="relative flex items-start gap-3 pb-4 last:pb-0"
          >
            {/* Timeline line */}
            {index < PLACEHOLDER_ACTIVITY.length - 1 && (
              <span
                className="absolute left-1.75 top-4 bottom-0 w-px bg-(--border)"
                aria-hidden="true"
              />
            )}

            {/* Dot */}
            <span
              className={cn(
                'mt-1 w-3.5 h-3.5 rounded-full border-2 border-(--surface-1) shrink-0',
                item.severity ? SEVERITY_DOT[item.severity] : 'bg-(--border-strong)'
              )}
              aria-hidden="true"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-(--foreground) leading-snug truncate-2">
                {item.message}
              </p>
              <p className="text-[10px] text-(--foreground-subtle) mt-0.5">
                {item.actor} · {item.time}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
