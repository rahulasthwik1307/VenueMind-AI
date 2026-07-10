import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { WelcomeBanner } from '@/components/operations/WelcomeBanner';
import { QuickStats } from '@/components/operations/QuickStats';
import { CriticalIncidents } from '@/components/operations/CriticalIncidents';
import { AIRecommendations } from '@/components/operations/AIRecommendations';
import { RecentActivity } from '@/components/operations/RecentActivity';
import { LiveStadiumOverview } from '@/components/operations/LiveStadiumOverview';

export const metadata: Metadata = {
  title: 'Dashboard',
};

/**
 * Dashboard — VenueMind AI Operations Command Center home page.
 *
 * Moved from app/page.tsx to app/(app)/dashboard/page.tsx as part of Stage 6.
 * The root "/" now serves the marketing landing page; the dashboard lives at
 * "/dashboard" inside the (app) route group (inherits AppShell).
 *
 * Layout:
 * ┌────────────────────────────────┐
 * │        Welcome Banner          │
 * ├──────────────────┬─────────────┤
 * │   Quick Stats (4 columns)      │
 * ├──────────────────┬─────────────┤
 * │ Critical         │ AI Recs     │
 * │ Incidents        │             │
 * ├──────────────────┬─────────────┤
 * │ Live Stadium     │ Recent      │
 * │ Overview         │ Activity    │
 * └──────────────────┴─────────────┘
 */
export default function DashboardPage() {
  return (
    <PageContainer>
      <div className="space-y-(--card-gap) animate-fade-in pb-8">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Quick Statistics */}
        <QuickStats />

        {/* Main two-column grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-(--card-gap) xl:h-125 items-stretch">
          <CriticalIncidents className="h-full" />
          <AIRecommendations className="h-full" />
        </div>

        {/* Bottom two-column grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-(--card-gap)">
          <LiveStadiumOverview />
          <RecentActivity />
        </div>
      </div>
    </PageContainer>
  );
}
