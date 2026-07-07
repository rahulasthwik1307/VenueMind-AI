import {
  AlertTriangle,
  Users,
  Bus,
  HeartPulse,
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';

const METRICS = [
  {
    label: 'Active Incidents',
    value: '3',
    icon: AlertTriangle,
    accent: 'error' as const,
    trend: 'up' as const,
    trendLabel: '+1 from last hour',
    description: 'Requires attention',
  },
  {
    label: 'Crowd Density',
    value: '72%',
    icon: Users,
    accent: 'warning' as const,
    trend: 'up' as const,
    trendLabel: 'Approaching high',
    description: 'Stadium capacity',
  },
  {
    label: 'Transport Status',
    value: 'Good',
    icon: Bus,
    accent: 'secondary' as const,
    trend: 'neutral' as const,
    trendLabel: 'All routes normal',
    description: 'Metro, Bus, Shuttle',
  },
  {
    label: 'Medical Units',
    value: '8',
    icon: HeartPulse,
    accent: 'primary' as const,
    trend: 'neutral' as const,
    trendLabel: '2 deployed',
    description: 'On standby',
  },
] as const;

export function QuickStats() {
  return (
    <section
      aria-label="Quick statistics overview"
      className="grid grid-cols-2 lg:grid-cols-4 gap-(--card-gap)"
    >
      {METRICS.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          icon={metric.icon}
          accent={metric.accent}
          trend={metric.trend}
          trendLabel={metric.trendLabel}
          description={metric.description}
        />
      ))}
    </section>
  );
}
