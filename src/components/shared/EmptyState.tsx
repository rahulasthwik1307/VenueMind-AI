import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No data available',
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center',
        'border-2 border-dashed border-(--border-strong) rounded-card',
        'bg-(--surface-2)',
        className
      )}
      role="status"
      aria-label={title}
    >
      <div
        className="w-12 h-12 rounded-lg bg-(--surface-3) flex items-center justify-center mb-3"
        aria-hidden="true"
      >
        {icon ?? (
          <Inbox
            size={22}
            strokeWidth={1.5}
            className="text-(--foreground-subtle)"
          />
        )}
      </div>
      <p className="text-sm font-semibold text-(--foreground)">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-(--foreground-muted) max-w-60 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
