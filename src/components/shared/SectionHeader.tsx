import { cn } from '../../utils/cn';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** Optional override for the heading's Tailwind classes (size, weight, etc.) */
  titleClassName?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 mb-4',
        className
      )}
    >
      <div className="min-w-0">
        <h2
          className={cn(
            'text-sm font-semibold text-(--foreground) tracking-tight leading-snug',
            titleClassName
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-(--foreground-muted)">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
