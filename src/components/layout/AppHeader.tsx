'use client';

import { useState, useEffect, useRef } from 'react';
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
  const activities = useIncidentStore((state) => state.activities);
  const telemetry = useIncidentStore((state) => state.telemetry);
  const time = useLiveTime();
  const date = useLiveDate();
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Notification center state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  type NotifCategory = 'All' | 'Critical' | 'Operational' | 'Simulation' | 'System' | 'Transport' | 'Weather';
  const [activeTab, setActiveTab] = useState<NotifCategory>('All');

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('read_notifications');
        if (saved) {
          setReadNotifIds(JSON.parse(saved) as string[]);
        }
      } catch {
        // ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
    if (readNotifIds.includes(id)) return;
    const next = [...readNotifIds, id];
    setReadNotifIds(next);
    localStorage.setItem('read_notifications', JSON.stringify(next));
  };

  const markAllAsRead = () => {
    const allIds = activities.map((a) => a.id);
    setReadNotifIds(allIds);
    localStorage.setItem('read_notifications', JSON.stringify(allIds));
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
        {/* Stadium Occupancy Gauge */}
        {(() => {
          const occupancyPercent = telemetry?.stadiumCapacity.value ?? 62;
          return (
            <div 
              className="flex items-center gap-2 mr-3 px-2 py-0.5 rounded bg-(--surface-2) border border-(--border)"
              title={`Global Stadium Occupancy: ${occupancyPercent}% capacity`}
              role="img"
              aria-label={`Global Stadium Occupancy: ${occupancyPercent}%`}
            >
              <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                <svg 
                  className="w-full h-full select-none"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', animation: 'none' }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="stroke-(--border-strong)"
                    strokeWidth="2"
                    fill="transparent"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="stroke-(--primary)"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 9}`}
                    strokeDashoffset={`${2 * Math.PI * 9 * (1 - occupancyPercent / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <span className="absolute text-[7.5px] font-black font-mono text-(--foreground)">{occupancyPercent}%</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[7px] font-bold font-mono text-(--foreground-subtle) uppercase leading-none">Global Cap</span>
                <span className="text-[8.5px] font-extrabold font-mono text-(--foreground) leading-tight mt-0.5">{(80000 * occupancyPercent / 100).toLocaleString()} pax</span>
              </div>
            </div>
          );
        })()}

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

        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className={cn(
              'flex items-center justify-center gap-1 w-auto h-8 px-2 rounded-md border border-(--border)',
              'bg-(--surface-1) text-(--foreground-muted)',
              'hover:text-(--foreground) hover:bg-(--surface-3) transition-colors duration-150',
              isLangOpen && 'bg-(--surface-3) text-(--foreground)'
            )}
            aria-label={`Language: ${language.toUpperCase()}. Change language.`}
            aria-expanded={isLangOpen}
            aria-haspopup="listbox"
            title="Change AI response language"
          >
            <Languages size={12} strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[9px] font-bold font-mono">{language.toUpperCase()}</span>
          </button>

          <AnimatePresence>
            {isLangOpen && (
              <m.ul
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1.5 w-36 bg-(--surface-1) border border-(--border) rounded-md shadow-lg z-50 py-1 overflow-hidden"
                role="listbox"
                aria-label="Select language"
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
          className="flex items-center justify-center w-8 h-8 rounded-md border border-(--border) bg-(--surface-1) text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-3) transition-colors cursor-pointer mr-2"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={cn(
              'relative flex items-center justify-center w-9 h-9 rounded-md',
              'text-(--foreground-muted) hover:bg-(--surface-3) hover:text-(--foreground)',
              isNotifOpen && 'bg-(--surface-3) text-(--foreground)',
              'transition-colors duration-150'
            )}
            aria-label={`View notifications (${unreadCount} unread)`}
            aria-expanded={isNotifOpen}
          >
            <Bell size={16} strokeWidth={1.75} aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-3.5 h-3.5 px-0.5 rounded-full bg-red-500 border border-(--surface-1) text-[8px] font-bold font-mono text-white"
                aria-label={`${unreadCount} unread`}
              >
                {unreadCount}
              </span>
            )}
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
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.97 }}
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
