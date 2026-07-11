import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  description?: string;
  accent?: 'primary' | 'secondary' | 'accent' | 'error' | 'warning';
  className?: string;
}

const ACCENT_STYLES: Record<
  NonNullable<MetricCardProps['accent']>,
  { icon: string; badge: string }
> = {
  primary: {
    icon: 'bg-(--primary-muted) text-(--primary)',
    badge: 'text-(--primary)',
  },
  secondary: {
    icon: 'bg-(--secondary-muted) text-(--secondary)',
    badge: 'text-(--secondary)',
  },
  accent: {
    icon: 'bg-(--accent-muted) text-(--accent)',
    badge: 'text-(--accent)',
  },
  error: {
    icon: 'bg-red-50 text-red-600',
    badge: 'text-red-600',
  },
  warning: {
    icon: 'bg-yellow-50 text-yellow-600',
    badge: 'text-yellow-600',
  },
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  description,
  accent = 'primary',
  className,
}: MetricCardProps) {
  const accentStyle = ACCENT_STYLES[accent];

  return (
    <div
      className={cn(
        'bg-(--surface-1) border border-(--border) rounded-card',
        'p-5 transition-shadow duration-200 hover:shadow-(--shadow-md)',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-(--foreground-muted) uppercase tracking-wide">
            {label}
          </p>
          <p
            className={cn(
              'mt-1.5 text-2xl font-bold text-(--foreground) leading-none',
              'font-(--font-mono)'
            )}
          >
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-(--foreground-subtle)">
              {description}
            </p>
          )}
          {trendLabel && (
            <p
              className={cn(
                'mt-1.5 text-xs font-medium',
                trend === 'up' && 'text-green-600',
                trend === 'down' && 'text-red-600',
                trend === 'neutral' && 'text-(--foreground-muted)'
              )}
              aria-label={`Trend: ${trendLabel}`}
            >
              {trend === 'up' && '↑ '}
              {trend === 'down' && '↓ '}
              {trendLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'w-9 h-9 rounded-md flex items-center justify-center shrink-0',
              accentStyle.icon
            )}
            aria-hidden="true"
          >
            <Icon size={16} strokeWidth={1.75} />
          </div>
        )}
      </div>
    </div>
  );
}
