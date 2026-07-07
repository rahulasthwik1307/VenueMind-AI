'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Settings,
  Sun,
  Moon,
  Monitor,
  Menu,
  Cpu,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { HEADER_HEIGHT } from '@/constants/layout';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useIncidentStore } from '@/store/modules/incident';

interface AppHeaderProps {
  onMobileMenuOpen?: () => void;
}

const OPERATOR_INITIALS = 'RA';
const OPERATOR_NAME = 'Rahul Asthwik';

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

export function AppHeader({ onMobileMenuOpen }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const searchQuery = useIncidentStore((state) => state.searchQuery);
  const setSearchQuery = useIncidentStore((state) => state.setSearchQuery);
  const time = useLiveTime();
  const date = useLiveDate();

  const cycleTheme = () => {
    const next: Record<typeof theme, typeof theme> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    };
    setTheme(next[theme]);
  };

  const ThemeIcon =
    theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  const themeLabel =
    theme === 'dark'
      ? 'Switch to system theme'
      : theme === 'light'
        ? 'Switch to dark theme'
        : 'Switch to light theme';

  return (
    <header
      className={cn(
        'shrink-0 flex items-center justify-between gap-4',
        'bg-(--surface-1) border-b border-(--border)',
        'px-4 md:px-5',
        'z-20 sticky top-0'
      )}
      style={{ height: HEADER_HEIGHT }}
      role="banner"
    >
      {/* --- Left: Mobile menu + Logo (mobile only) --- */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className={cn(
            'md:hidden flex items-center justify-center w-9 h-9 rounded-md',
            'text-(--foreground-muted) hover:bg-(--surface-3) hover:text-(--foreground)',
            'transition-colors duration-150'
          )}
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
        >
          <Menu size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>

        {/* Mobile Logo (hidden on desktop since sidebar shows it) */}
        <div className="flex items-center gap-2 md:hidden">
          <div
            className="w-6 h-6 rounded-sm bg-(--primary) flex items-center justify-center"
            aria-hidden="true"
          >
            <Cpu size={12} strokeWidth={1.75} className="text-white" />
          </div>
          <span className="text-sm font-bold text-(--foreground) leading-none">
            VenueMind <span className="text-(--primary)">AI</span>
          </span>
        </div>

        {/* Desktop page title area */}
        <div className="hidden md:block">
          <span className="text-xs font-medium text-(--foreground-muted)">
            FIFA World Cup 2026 — Stadium Operations
          </span>
        </div>
      </div>

      {/* --- Center: Global Search --- */}
      <div className="flex-1 max-w-md hidden sm:block">
        <label htmlFor="global-search" className="sr-only">
          Search incidents, alerts, and operations
        </label>
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.75}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--foreground-subtle) pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="global-search"
            type="search"
            placeholder="Search incidents by title, location, category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-9 pr-3 py-1.5 text-sm',
              'bg-(--surface-2) border border-(--border)',
              'rounded-md text-(--foreground)',
              'placeholder:text-(--foreground-subtle)',
              'focus:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)'
            )}
            aria-label="Search incidents"
          />
          <span
            className="hidden lg:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] text-(--foreground-subtle) font-mono border border-(--border) rounded px-1 py-0.5"
            aria-hidden="true"
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* --- Right: Controls --- */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Date/Time */}
        <div
          className="hidden lg:flex flex-col items-end mr-2"
          aria-label={`Current time: ${time}, ${date}`}
          role="timer"
        >
          <span className="text-sm font-semibold text-(--foreground) leading-tight font-mono tabular-nums">
            {time || '──:──'}
          </span>
          <span className="text-[10px] text-(--foreground-subtle) leading-tight" suppressHydrationWarning>
            {date}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-md',
            'text-(--foreground-muted) hover:bg-(--surface-3) hover:text-(--foreground)',
            'transition-colors duration-150'
          )}
          aria-label={themeLabel}
          title={themeLabel}
        >
          <ThemeIcon size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>

        {/* Notifications */}
        <button
          className={cn(
            'relative flex items-center justify-center w-9 h-9 rounded-md',
            'text-(--foreground-muted) hover:bg-(--surface-3) hover:text-(--foreground)',
            'transition-colors duration-150'
          )}
          aria-label="View notifications (3 unread)"
        >
          <Bell size={16} strokeWidth={1.75} aria-hidden="true" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-(--color-error) border-2 border-(--surface-1) live-indicator"
            aria-hidden="true"
          />
        </button>

        {/* Settings */}
        <button
          className={cn(
            'hidden sm:flex items-center justify-center w-9 h-9 rounded-md',
            'text-(--foreground-muted) hover:bg-(--surface-3) hover:text-(--foreground)',
            'transition-colors duration-150'
          )}
          aria-label="Open settings"
        >
          <Settings size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>

        {/* Divider */}
        <div
          className="hidden sm:block w-px h-5 bg-(--border-strong) mx-1"
          aria-hidden="true"
        />

        {/* Operator Avatar */}
        <button
          className={cn(
            'flex items-center gap-2 rounded-md px-1.5 py-1',
            'hover:bg-(--surface-3) transition-colors duration-150'
          )}
          aria-label={`Operator: ${OPERATOR_NAME}. Open profile menu.`}
          aria-haspopup="menu"
        >
          <div
            className="w-7 h-7 rounded-full bg-(--primary) flex items-center justify-center text-white text-[10px] font-bold shrink-0"
            aria-hidden="true"
          >
            {OPERATOR_INITIALS}
          </div>
          <span className="hidden lg:block text-xs font-semibold text-(--foreground) leading-tight">
            {OPERATOR_NAME}
          </span>
        </button>
      </div>
    </header>
  );
}
