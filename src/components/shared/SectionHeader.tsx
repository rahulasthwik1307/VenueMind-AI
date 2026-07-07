import { cn } from '../../utils/cn';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 mb-4',
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-(--foreground) tracking-tight leading-snug">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-(--foreground-muted)">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0">{action}</div>
      )}
    </div>
  );
}
