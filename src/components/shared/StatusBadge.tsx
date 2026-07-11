import type { SystemStatusLevel } from '@/types/common';
import { cn } from '@/utils/cn';

interface StatusBadgeProps {
  level: SystemStatusLevel;
  label: string;
  showDot?: boolean;
  className?: string;
}

const STATUS_STYLES: Record<SystemStatusLevel, { badge: string; dot: string }> = {
  operational: {
    badge: 'bg-green-50 text-green-700 border-green-100',
    dot: 'bg-green-500',
  },
  degraded: {
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    dot: 'bg-yellow-500',
  },
  critical: {
    badge: 'bg-red-50 text-red-700 border-red-100',
    dot: 'bg-red-500',
  },
  offline: {
    badge: 'bg-gray-50 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
  },
};

export function StatusBadge({
  level,
  label,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const styles = STATUS_STYLES[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border rounded-full',
        styles.badge,
        className
      )}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            styles.dot,
            level === 'operational' && 'live-indicator'
          )}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}
