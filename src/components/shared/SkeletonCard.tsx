import { SkeletonLine } from './SkeletonLine';
import { cn } from '../../utils/cn';

interface SkeletonCardProps {
  lines?: number;
  hasHeader?: boolean;
  className?: string;
}

export function SkeletonCard({
  lines = 3,
  hasHeader = true,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-(--surface-1) border border-(--border) rounded-card p-5 space-y-3',
        className
      )}
      role="status"
      aria-label="Loading content"
      aria-busy="true"
    >
      {hasHeader && (
        <div className="space-y-2">
          <SkeletonLine width="1/2" className="h-5" />
          <SkeletonLine width="1/3" className="h-3" />
        </div>
      )}
      <div className="space-y-2 pt-1">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 ? '2/3' : 'full'}
          />
        ))}
      </div>
    </div>
  );
}
