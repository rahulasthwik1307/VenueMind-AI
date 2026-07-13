'use client';

import { cn } from '@/utils/cn';
import { usePathname } from 'next/navigation';

import { MatchSection } from './rightPanel/MatchSection';
import { WeatherSection } from './rightPanel/WeatherSection';
import { SystemHealthSection } from './rightPanel/SystemHealthSection';
import { QuickActionsSection } from './rightPanel/QuickActionsSection';
import { OperationsNotesSection } from './rightPanel/OperationsNotesSection';
import { RecentAlertsSection } from './rightPanel/RecentAlertsSection';

export function RightPanel() {
  const pathname = usePathname();
  if (pathname === '/map') return null;

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col shrink-0 w-(--right-panel-width) h-full',
        'bg-(--surface-1) border-l border-(--border) overflow-hidden'
      )}
      aria-label="Operations context panel"
      role="complementary"
    >
      <div className="shrink-0 px-4 py-3 border-b border-(--border) bg-(--surface-1)">
        <h2 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
          Operations Panel
        </h2>
        <p className="text-[9px] font-mono text-(--foreground-subtle) mt-0.5">
          FIFA WC 2026 · Al Bayt Stadium
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto divide-y divide-(--border) scrollbar-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)"
        tabIndex={0}
        role="region"
        aria-label="Operations panel content"
      >
        <MatchSection />
        <WeatherSection />
        <SystemHealthSection />
        <QuickActionsSection />
        <OperationsNotesSection />
        <RecentAlertsSection />
      </div>

      {/* Visual Terminus */}
      <div className="shrink-0 border-t border-(--border) bg-(--surface-2) px-4 py-2 text-center text-[9px] font-mono text-(--foreground-subtle)">
        <span>SECURE ENDPOINT · ACTIVE STATUS</span>
      </div>
    </aside>
  );
}
