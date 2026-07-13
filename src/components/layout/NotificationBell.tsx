import { Bell } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface NotificationBellProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount: number;
}

export function NotificationBell({ onClick, isOpen, unreadCount }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-lg border border-(--border)',
        'bg-(--surface-1) text-(--foreground-muted) shadow-xs',
        'hover:text-(--foreground) hover:bg-(--surface-2) hover:border-(--border-strong)',
        'transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-(--primary-muted)/40 focus-visible:outline-none',
        isOpen && 'bg-(--surface-3) text-(--foreground) border-(--border-strong)'
      )}
      aria-label={`View notifications (${unreadCount} unread)`}
      aria-expanded={isOpen}
    >
      <Bell size={15} className={cn(unreadCount > 0 && 'animate-pulse')} aria-hidden="true" />
      
      <AnimatePresence>
        {unreadCount > 0 && (
          <m.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={cn(
              'absolute -top-1 -right-1 flex items-center justify-center',
              'min-w-4 h-4 px-1 rounded-full bg-red-500 border border-(--surface-1)',
              'text-[9px] font-bold font-mono text-white shadow-xs'
            )}
          >
            {/* Glowing background halo */}
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-35" />
            <span className="relative z-10">{unreadCount}</span>
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
}
