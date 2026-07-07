import { Trophy, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

const OPERATOR_NAME = 'Rahul Asthwik';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function WelcomeBanner() {
  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={cn(
        'bg-(--surface-1) border border-(--border) rounded-card',
        'p-5 flex items-start justify-between gap-4 flex-wrap'
      )}
      role="region"
      aria-label="Welcome banner"
    >
      {/* Left: Greeting */}
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-medium text-(--foreground-muted) uppercase tracking-wide">
          {greeting}
        </p>
        <h1 className="text-xl font-bold text-(--foreground) leading-tight tracking-tight">
          {OPERATOR_NAME}
        </h1>
        <p className="text-sm text-(--foreground-muted) flex items-center gap-1.5">
          <Calendar size={12} strokeWidth={1.75} aria-hidden="true" />
          {today}
        </p>
      </div>

      {/* Right: Match Context */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-md',
          'bg-(--primary-muted) border border-(--primary-light)'
        )}
        role="status"
        aria-label="Current match status"
      >
        <div
          className="w-8 h-8 rounded-sm bg-(--primary) flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Trophy size={15} strokeWidth={1.75} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-(--primary) leading-tight">
            Match in Progress
          </p>
          <p className="text-[11px] text-(--primary) opacity-75 leading-tight mt-0.5">
            Brazil vs Argentina · Al Bayt Stadium
          </p>
        </div>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-(--primary) text-white live-indicator uppercase"
          aria-label="Live match"
        >
          Live
        </span>
      </div>
    </div>
  );
}
