import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center',
        'border border-red-100 rounded-card',
        'bg-red-50/50',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div
        className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-3"
        aria-hidden="true"
      >
        <AlertCircle size={22} strokeWidth={1.5} className="text-red-600" />
      </div>
      <p className="text-sm font-semibold text-red-700">{title}</p>
      {message && (
        <p className="mt-1 text-xs text-red-600/80 max-w-60 leading-relaxed">
          {message}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            'mt-4 px-4 py-1.5 text-xs font-semibold text-white',
            'bg-red-600 rounded-sm hover:bg-red-700',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
          )}
          aria-label="Retry loading data"
        >
          Retry
        </button>
      )}
    </div>
  );
}
