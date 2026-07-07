import { PageContainer } from '@/components/layout/PageContainer';
import { WelcomeBanner } from '@/components/operations/WelcomeBanner';
import { QuickStats } from '@/components/operations/QuickStats';
import { CriticalIncidents } from '@/components/operations/CriticalIncidents';
import { AIRecommendations } from '@/components/operations/AIRecommendations';
import { RecentActivity } from '@/components/operations/RecentActivity';
import { LiveStadiumOverview } from '@/components/operations/LiveStadiumOverview';

/**
 * Dashboard — VenueMind AI Operations Command Center home page.
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
      <div className="space-y-(--card-gap) animate-fade-in">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Quick Statistics */}
        <QuickStats />

        {/* Main two-column grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-(--card-gap)">
          <CriticalIncidents />
          <AIRecommendations />
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
