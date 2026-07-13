import { useState } from 'react';
import { X, Shield, Activity, Clock, Cpu, Bus, Cloud, Info } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useIncidentStore } from '@/store/modules/incident';
import { NotificationBell } from './NotificationBell';

type NotifCategory = 'All' | 'Critical' | 'Operational' | 'Simulation' | 'System' | 'Transport' | 'Weather';

export function NotificationCenter() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotifCategory>('All');

  const activities = useIncidentStore((state) => state.activities);
  const readNotifIds = useIncidentStore((state) => state.readNotifIds);
  const markNotifRead = useIncidentStore((state) => state.markNotifRead);
  const markAllNotifsRead = useIncidentStore((state) => state.markAllNotifsRead);

  const unreadCount = activities.filter((a) => !readNotifIds.includes(a.id)).length;

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

  return (
    <div className="relative">
      <NotificationBell
        onClick={() => setIsNotifOpen(!isNotifOpen)}
        isOpen={isNotifOpen}
        unreadCount={unreadCount}
      />

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
              className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 bg-(--surface-1) border border-(--border) rounded-lg shadow-xl z-50 flex flex-col max-h-[85vh] sm:max-h-105 overflow-hidden"
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
  );
}
