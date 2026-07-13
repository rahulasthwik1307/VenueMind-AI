import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PanelSection } from './PanelSection';

export function RecentAlertsSection() {
  const [collapsed, setCollapsed] = useState(true);
  const alerts = [
    { id: 'a1', message: 'Gate 7 — overcrowding detected', level: 'high', time: '2m ago' },
    { id: 'a2', message: 'Medical team dispatched to sector C', level: 'medium', time: '8m ago' },
    { id: 'a3', message: 'Transport delay on Line 2', level: 'low', time: '15m ago' },
  ];

  const alertStyles: Record<string, { border: string; bg: string }> = {
    high: { border: 'border-l-red-500', bg: 'bg-red-50/20 dark:bg-red-950/10' },
    medium: { border: 'border-l-yellow-500', bg: 'bg-yellow-50/20 dark:bg-yellow-950/10' },
    low: { border: 'border-l-blue-400', bg: 'bg-blue-50/20 dark:bg-blue-950/10' },
  };

  const renderAlert = (alert: typeof alerts[0]) => {
    const styles = alertStyles[alert.level] || alertStyles.low;
    return (
      <div
        key={alert.id}
        className={cn(
          'relative border border-(--border)/60 border-l-3 rounded-sm p-1.5 text-[10px] leading-snug space-y-0.5 animate-fade-in',
          styles.border,
          styles.bg
        )}
      >
        <div className="flex justify-between items-center text-[8px] font-mono text-(--foreground-subtle)">
          <span className="font-semibold uppercase tracking-wider">{alert.level} PRIORITY</span>
          <span>{alert.time}</span>
        </div>
        <p className="text-(--foreground-muted) whitespace-pre-wrap wrap-break-word leading-relaxed">
          {alert.message}
        </p>
      </div>
    );
  };

  return (
    <PanelSection title="Recent Alerts" className="py-2 border-b-0">
      <div className="space-y-1.5">
        {/* Most recent alert is always visible */}
        {alerts.length > 0 && renderAlert(alerts[0])}

        {/* Toggle for older alerts */}
        {alerts.length > 1 && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle) hover:text-(--foreground) transition-colors mt-2 cursor-pointer"
            aria-expanded={!collapsed}
          >
            <span>{collapsed ? 'Show more alerts' : 'Hide alerts history'}</span>
            {collapsed ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
          </button>
        )}

        {/* Scrollable list of older alerts */}
        {!collapsed && alerts.length > 1 && (
          <ul
            className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5 mt-2 custom-scrollbar-always animate-fade-in"
            aria-label="Older alerts history"
            aria-live="polite"
          >
            {alerts.slice(1).map((alert) => (
              <li key={alert.id}>
                {renderAlert(alert)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PanelSection>
  );
}
