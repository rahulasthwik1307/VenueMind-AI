'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  Settings,
  Sun,
  Moon,
  Menu,
  Cpu,
  Shield,
  Bus,
  Cloud,
  Clock,
  Activity,
  Info,
  X,
  Languages
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { HEADER_HEIGHT } from '@/constants/layout';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useIncidentStore } from '@/store/modules/incident';
import { useUIStore } from '@/store/modules/ui';
import type { AssistantLanguage } from '@/types/assistant';

interface AppHeaderProps {
  onMobileMenuOpen?: () => void;
}

const OPERATOR_INITIALS = 'RA';

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
  const activities = useIncidentStore((state) => state.activities);
  const telemetry = useIncidentStore((state) => state.telemetry);
  const time = useLiveTime();
  const date = useLiveDate();
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Search focus state & keyboard shortcut ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Trigger search focus on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Notification center state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  
  const readNotifIds = useIncidentStore((state) => state.readNotifIds);
  const markNotifRead = useIncidentStore((state) => state.markNotifRead);
  const markAllNotifsRead = useIncidentStore((state) => state.markAllNotifsRead);

  type NotifCategory = 'All' | 'Critical' | 'Operational' | 'Simulation' | 'System' | 'Transport' | 'Weather';
  const [activeTab, setActiveTab] = useState<NotifCategory>('All');

  // Close language dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    if (isLangOpen) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isLangOpen]);

  const markAsRead = (id: string) => {
    markNotifRead(id);
  };

  const markAllAsRead = () => {
    markAllNotifsRead();
  };

  const getNotifCategory = (actor: string, message: string, severity?: string): NotifCategory => {
    if (severity === 'critical') return 'Critical';
    const a = actor.toLowerCase();
    const m = message.toLowerCase();
    if (a.includes('weather') || m.includes('weather') || m.includes('storm') || m.includes('lightning') || m.includes('rain')) {
      return 'Weather';
    }
    if (a.includes('transit') || a.includes('transport') || m.includes('transport') || m.includes('route') || m.includes('metro') || m.includes('bus') || a.includes('gps')) {
      return 'Transport';
    }
    if (a.includes('system') || a.includes('turnstile') || m.includes('system') || m.includes('scada') || m.includes('ticketing') || m.includes('cctv') || a.includes('monitor')) {
      return 'System';
    }
    if (a.includes('director') || a.includes('match') || m.includes('scenario') || m.includes('phase') || m.includes('goal')) {
      return 'Simulation';
    }
    return 'Operational';
  };

  const getCategoryIcon = (cat: NotifCategory) => {
    switch (cat) {
      case 'Critical': return <Shield className="text-red-500 shrink-0" size={12} />;
      case 'Operational': return <Activity className="text-blue-500 shrink-0" size={12} />;
      case 'Simulation': return <Clock className="text-emerald-500 shrink-0" size={12} />;
      case 'System': return <Cpu className="text-gray-500 shrink-0" size={12} />;
      case 'Transport': return <Bus className="text-amber-500 shrink-0" size={12} />;
      case 'Weather': return <Cloud className="text-sky-500 shrink-0" size={12} />;
      default: return <Info className="text-gray-400 shrink-0" size={12} />;
    }
  };

  const filteredNotifs = activities.filter((a) => {
    if (activeTab === 'All') return true;
    return getNotifCategory(a.actor, a.message, a.severity) === activeTab;
  }).slice(0, 25);

  const unreadCount = activities.filter((a) => !readNotifIds.includes(a.id)).length;

  return (
    <header
      className={cn(
        'shrink-0 grid grid-cols-[1fr_minmax(0,480px)_1fr] items-center',
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
            'md:hidden flex items-center justify-center w-9.5 h-9.5 rounded-lg border border-(--border)',
            'bg-(--surface-1) text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-2)',
            'transition-all duration-200 focus-visible:ring-2 focus-visible:ring-(--primary-muted)/40 focus-visible:outline-none'
          )}
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
        >
          <Menu size={16} strokeWidth={1.75} aria-hidden="true" />
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

        {/* Desktop — Primary operational branding (sidebar already shows VenueMind AI) */}
        <div className="hidden md:flex flex-col justify-center select-none">
          <span className="text-[13px] font-bold text-(--foreground) leading-none tracking-tight">
            Stadium Operations
          </span>
          <span className="text-[10px] font-semibold text-(--foreground-subtle) tracking-wide leading-none mt-0.75">
            FIFA World Cup 2026
          </span>
        </div>
      </div>

      {/* --- Center: Global Search (grid center column — always the true midpoint) --- */}
      <div className="w-full hidden sm:block px-3 group">
        <label htmlFor="global-search" className="sr-only">
          Search incidents, alerts, and operations
        </label>
        <div className="relative flex items-center">
          <Search
            size={14}
            className="absolute left-3.5 text-(--foreground-subtle) pointer-events-none group-focus-within:text-(--primary) transition-colors duration-200"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            id="global-search"
            type="search"
            placeholder="Search incidents, alerts, or operations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-12 h-9.5 text-xs',
              'bg-(--surface-2) border border-(--border)',
              'rounded-lg text-(--foreground) placeholder:text-(--foreground-subtle)/70',
              'focus:outline-none focus:bg-(--surface-1) focus:border-(--primary)',
              'focus:ring-2 focus:ring-(--primary-muted)/40',
              'hover:bg-(--surface-3)/45 hover:border-(--border-strong)',
              'shadow-xs focus:shadow-sm',
              'transition-all duration-200 ease-in-out'
            )}
            aria-label="Search incidents"
          />
          <kbd
            className="hidden lg:flex absolute right-3 items-center justify-center h-5.5 px-1.5 rounded bg-(--surface-3) border border-(--border-strong)/30 text-[9px] font-medium font-mono text-(--foreground-subtle) select-none pointer-events-none transition-all duration-200 group-focus-within:scale-90 group-focus-within:opacity-0"
            aria-hidden="true"
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* --- Right: Controls --- */}
      <div className="flex items-center justify-end gap-1.5 md:gap-2">
        {/* Premium Global Capacity Widget */}
        {(() => {
          const occupancyPercent = telemetry?.stadiumCapacity.value ?? 62;
          const maxCapacity = 80000;
          const currentPax = maxCapacity * (occupancyPercent / 100);
          
          // SVG Gauge parameters
          const radius = 13;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference * (1 - occupancyPercent / 100);

          return (
            <m.div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg border border-(--border)',
                'bg-(--surface-1) shadow-xs select-none',
                'min-h-10.5 md:min-w-41',
                'cursor-default'
              )}
              title={`Global Stadium Occupancy: ${occupancyPercent}% capacity`}
              role="img"
              aria-label={`Global Stadium Occupancy: ${occupancyPercent}%`}
              whileHover={{ boxShadow: 'var(--shadow-sm)', y: -1 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {/* Animated progress ring — larger and crisper */}
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 select-none" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    className="stroke-(--border-strong)"
                    strokeWidth="2.5"
                    fill="transparent"
                  />
                  <m.circle
                    cx="16"
                    cy="16"
                    r={radius}
                    className="stroke-(--primary)"
                    strokeWidth="2.5"
                    fill="transparent"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    strokeDasharray={circumference}
                  />
                </svg>
                <span className="absolute text-[9px] font-black font-mono text-(--foreground) leading-none">
                  {occupancyPercent}%
                </span>
              </div>

              {/* Text block — hidden on mobile, shown md+ */}
              <div className="hidden md:flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-bold text-(--foreground-muted) uppercase tracking-widest leading-none">
                    Capacity
                  </span>
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                </div>
                <span className="text-[11px] font-bold font-mono text-(--foreground) leading-none tracking-tight tabular-nums">
                  {currentPax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  <span className="text-[9px] font-medium text-(--foreground-muted) ml-0.5">pax</span>
                </span>
              </div>
            </m.div>
          );
        })()}

        {/* Premium Time & Date Capsule — sibling of Capacity card */}
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

        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className={cn(
              'flex items-center justify-center gap-1.5 h-9.5 px-2.5 rounded-lg border border-(--border)',
              'bg-(--surface-1) text-(--foreground-muted) shadow-xs',
              'hover:text-(--foreground) hover:bg-(--surface-2) hover:border-(--border-strong)',
              'transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-(--primary-muted)/40 focus-visible:outline-none',
              isLangOpen && 'bg-(--surface-3) text-(--foreground) border-(--border-strong)'
            )}
            aria-label={`AI Response Language: ${language.toUpperCase()}. Click to change.`}
            aria-expanded={isLangOpen}
            aria-haspopup="listbox"
            title="AI Response Language (does not translate full UI)"
          >
            <Languages size={15} className="shrink-0 text-(--foreground-muted)" aria-hidden="true" />
            <span className="hidden md:inline text-[10px] font-bold font-mono tracking-wider">{language.toUpperCase()}</span>
          </button>

          <AnimatePresence>
            {isLangOpen && (
              <m.ul
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-40 bg-(--surface-1) border border-(--border) rounded-lg shadow-lg z-50 py-1 overflow-hidden"
                role="listbox"
                aria-label="Select AI Response Language"
              >
                {([
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Español' },
                  { value: 'fr', label: 'Français' },
                  { value: 'pt', label: 'Português' },
                  { value: 'hi', label: 'हिंदी' },
                ] as { value: AssistantLanguage; label: string }[]).map(({ value, label }) => (
                  <li
                    key={value}
                    role="option"
                    aria-selected={language === value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setLanguage(value);
                      setIsLangOpen(false);
                    }}
                    onClick={() => {
                      setLanguage(value);
                      setIsLangOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setLanguage(value);
                        setIsLangOpen(false);
                      }
                    }}
                    tabIndex={0}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs transition-colors',
                      language === value
                        ? 'bg-(--primary-muted) text-(--primary) font-semibold'
                        : 'text-(--foreground-muted) hover:bg-(--surface-2) hover:text-(--foreground)'
                    )}
                  >
                    <span className="text-[9px] font-mono font-bold w-5 text-(--foreground-subtle)">
                      {value.toUpperCase()}
                    </span>
                    {label}
                  </li>
                ))}
              </m.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center justify-center w-9.5 h-9.5 rounded-lg border border-(--border)',
            'bg-(--surface-1) text-(--foreground-muted) shadow-xs',
            'hover:text-(--foreground) hover:bg-(--surface-2) hover:border-(--border-strong)',
            'transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-(--primary-muted)/40 focus-visible:outline-none'
          )}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={cn(
              'relative flex items-center justify-center w-9.5 h-9.5 rounded-lg border border-(--border)',
              'bg-(--surface-1) text-(--foreground-muted) shadow-xs',
              'hover:text-(--foreground) hover:bg-(--surface-2) hover:border-(--border-strong)',
              'transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-(--primary-muted)/40 focus-visible:outline-none',
              isNotifOpen && 'bg-(--surface-3) text-(--foreground) border-(--border-strong)'
            )}
            aria-label={`View notifications (${unreadCount} unread)`}
            aria-expanded={isNotifOpen}
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

          <AnimatePresence>
            {isNotifOpen && (
              <>
                {/* Click outside backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotifOpen(false)}
                />
                
                <m.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-80 bg-(--surface-1) border border-(--border) rounded-lg shadow-xl z-50 flex flex-col max-h-105 overflow-hidden"
                  role="dialog"
                  aria-label="Notification center"
                >
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-(--border) shrink-0 bg-(--surface-2)">
                    <span className="text-[10px] font-bold text-(--foreground) uppercase tracking-wide font-mono">
                      Notification Center
                    </span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[9px] font-semibold text-(--primary) hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      <button 
                        onClick={() => setIsNotifOpen(false)}
                        className="text-(--foreground-subtle) hover:text-(--foreground) p-0.5"
                        aria-label="Close"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Tabs bar */}
                  <div className="flex gap-0.5 px-2 py-1.5 border-b border-(--border) overflow-x-auto shrink-0 bg-(--surface-2) scrollbar-none">
                    {(['All', 'Critical', 'Operational', 'Simulation', 'System', 'Transport', 'Weather'] as const).map((tab) => {
                      const count = tab === 'All' 
                        ? activities.length 
                        : activities.filter(a => getNotifCategory(a.actor, a.message, a.severity) === tab).length;
                      if (count === 0 && tab !== 'All') return null;

                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            'px-2 py-0.5 rounded text-[8px] font-semibold font-mono uppercase tracking-wide whitespace-nowrap transition-colors border',
                            activeTab === tab
                              ? 'bg-(--primary) text-white border-(--primary)'
                              : 'bg-(--surface-3) text-(--foreground-subtle) hover:bg-(--surface-4) border-(--border)'
                          )}
                        >
                          {tab} {count > 0 && `(${count})`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Notification List */}
                  <div className="flex-1 overflow-y-auto p-1.5 space-y-1 min-h-45">
                    {filteredNotifs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Info size={16} className="text-(--foreground-subtle) opacity-30 mb-1" />
                        <p className="text-[10px] text-(--foreground-subtle)">No alerts in this category</p>
                      </div>
                    ) : (
                      filteredNotifs.map((item) => {
                        const isRead = readNotifIds.includes(item.id);
                        const cat = getNotifCategory(item.actor, item.message, item.severity);

                        return (
                          <div
                            key={item.id}
                            onClick={() => markAsRead(item.id)}
                            className={cn(
                              'flex items-start gap-2 p-2 rounded cursor-pointer transition-colors border',
                              isRead 
                                ? 'bg-transparent border-transparent hover:bg-(--surface-2)' 
                                : 'bg-(--primary-muted)/40 border-(--primary-light)/20 hover:bg-(--primary-muted)/60'
                            )}
                          >
                            <div className="mt-0.5 shrink-0">
                              {getCategoryIcon(cat)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                'text-[10px] leading-snug wrap-break-word',
                                isRead ? 'text-(--foreground-muted)' : 'text-(--foreground) font-semibold'
                              )}>
                                {item.message}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 text-[8px] font-mono text-(--foreground-subtle)">
                                <span className="truncate font-semibold">{item.actor}</span>
                                <span>·</span>
                                <span>
                                  {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            {!isRead && (
                              <span 
                                className="w-1.5 h-1.5 rounded-full bg-(--primary) shrink-0 mt-1" 
                                aria-hidden="true" 
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </m.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            'hidden sm:flex items-center justify-center w-9.5 h-9.5 rounded-lg border border-(--border)',
            'bg-(--surface-1) text-(--foreground-muted) shadow-xs',
            'hover:text-(--foreground) hover:bg-(--surface-2) hover:border-(--border-strong)',
            'transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-(--primary-muted)/40 focus-visible:outline-none'
          )}
          aria-label="Open settings"
        >
          <Settings size={15} aria-hidden="true" />
        </Link>

        {/* Divider */}
        <div
          className="hidden sm:block w-px h-6 bg-(--border-strong) mx-1"
          aria-hidden="true"
        />

        {/* Operator Avatar */}
        <div className="relative group shrink-0 select-none mr-1">
          <div
            className={cn(
              'w-8.5 h-8.5 rounded-full bg-linear-to-br from-(--primary) to-emerald-600',
              'flex items-center justify-center text-white text-[11px] font-extrabold shadow-xs',
              'border border-(--border-strong)/30',
              'group-hover:scale-105 group-hover:shadow-md transition-all duration-200 ease-out cursor-pointer'
            )}
            aria-label="User profile"
          >
            {OPERATOR_INITIALS}
          </div>
          {/* Live Status Online Indicator */}
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-(--surface-1) shadow-xs animate-pulse" />
        </div>
      </div>
    </header>
  );
}
