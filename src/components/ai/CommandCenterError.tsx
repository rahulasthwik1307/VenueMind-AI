'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AssistantError, AssistantErrorType } from '@/types/assistant';

interface CommandCenterErrorProps {
  error: AssistantError;
  onRetry: () => void;
  className?: string;
}

const ERROR_CONFIGS: Record<AssistantErrorType, { title: string }> = {
  network: { title: 'Connection error' },
  validation: { title: 'Unexpected AI response' },
  timeout: { title: 'Request timed out' },
  rate_limit: { title: 'Rate limit reached' },
  unauthorized: { title: 'Authorization error' },
  unknown: { title: 'Unexpected error' },
};

export function CommandCenterError({ error, onRetry, className }: CommandCenterErrorProps) {
  const config = ERROR_CONFIGS[error.type] ?? ERROR_CONFIGS.unknown;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center gap-4',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertCircle size={18} className="text-red-500" aria-hidden="true" />
      </div>

      {/* Copy */}
      <div className="space-y-1 max-w-xs">
        <p className="text-sm font-bold text-(--foreground)">{config.title}</p>
        <p className="text-xs text-(--foreground-muted) leading-relaxed">{error.message}</p>
      </div>

      {/* Retry */}
      {error.type !== 'unauthorized' && (
        <button
          onClick={onRetry}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md',
            'text-xs font-semibold text-(--primary)',
            'bg-(--primary-muted) border border-(--primary-light)',
            'hover:bg-(--primary-light)/60 active:scale-[0.98]',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)'
          )}
          aria-label="Retry the failed AI request"
        >
          <RefreshCw size={12} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
