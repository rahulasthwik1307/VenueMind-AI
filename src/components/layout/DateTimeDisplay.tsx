import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { m } from 'framer-motion';
import { cn } from '@/utils/cn';

function useLiveTime() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return time;
}

function useLiveDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function DateTimeDisplay() {
  const time = useLiveTime();
  const date = useLiveDate();

  return (
    <m.div
      className={cn(
        'hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg border border-(--border)',
        'bg-(--surface-1) shadow-xs select-none min-h-10.5 cursor-default'
      )}
      aria-label={`Current time: ${time}, ${date}`}
      role="timer"
      whileHover={{ boxShadow: 'var(--shadow-sm)', y: -1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Clock icon — appears first, mirrors ring position in Capacity card */}
      <div
        className="w-8 h-8 rounded-md bg-(--surface-2) flex items-center justify-center border border-(--border) text-(--foreground-muted) shrink-0"
        aria-hidden="true"
      >
        <Clock size={14} strokeWidth={1.75} />
      </div>
      {/* Text block */}
      <div className="flex flex-col justify-center">
        <span
          className="text-[13px] font-bold text-(--foreground) font-mono leading-none tracking-tight tabular-nums"
          suppressHydrationWarning
        >
          {time || '──:──'}
          <span className="text-[9px] font-semibold text-(--foreground-subtle) ml-1.5 uppercase tracking-widest">UTC</span>
        </span>
        <span
          className="text-[9px] font-semibold text-(--foreground-muted) uppercase tracking-wider leading-none mt-0.75"
          suppressHydrationWarning
        >
          {date}
        </span>
      </div>
    </m.div>
  );
}
