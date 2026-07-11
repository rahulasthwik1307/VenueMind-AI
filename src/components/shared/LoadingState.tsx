import { cn } from '@/utils/cn';

interface LoadingStateProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_STYLES = {
  sm: { spinner: 'w-4 h-4 border-2', text: 'text-xs' },
  md: { spinner: 'w-6 h-6 border-2', text: 'text-sm' },
  lg: { spinner: 'w-8 h-8 border-[3px]', text: 'text-sm' },
};

export function LoadingState({
  label = 'Loading…',
  size = 'md',
  className,
}: LoadingStateProps) {
  const styles = SIZE_STYLES[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-8',
        className
      )}
      role="status"
      aria-label={label}
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className={cn(
          styles.spinner,
          'rounded-full border-(--border-strong) border-t-(--primary) animate-spin'
        )}
        aria-hidden="true"
      />
      <span className={cn('text-(--foreground-muted) font-medium', styles.text)}>
        {label}
      </span>
    </div>
  );
}
