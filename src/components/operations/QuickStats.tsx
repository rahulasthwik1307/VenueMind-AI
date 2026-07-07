'use client';

import {
  AlertTriangle,
  Users,
  Bus,
  HeartPulse,
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { useIncident } from '@/hooks/useIncident';

export function QuickStats() {
  const { incidents, stadiumStats } = useIncident();

  const activeCount = incidents.filter((i) => i.status !== 'resolved').length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;

  const metrics = [
    {
      label: 'Active Incidents',
      value: activeCount.toString(),
      icon: AlertTriangle,
      accent: 'error' as const,
      trend: criticalCount > 0 ? ('up' as const) : ('neutral' as const),
      trendLabel: criticalCount > 0 ? `${criticalCount} Critical active` : 'No Critical alerts',
      description: 'Requires response dispatch',
    },
    {
      label: 'Crowd Density',
      value: `${stadiumStats.crowdDensity}%`,
      icon: Users,
      accent: stadiumStats.crowdDensity > 80 ? ('warning' as const) : ('primary' as const),
      trend: 'up' as const,
      trendLabel: stadiumStats.crowdDensity > 80 ? 'Approaching capacity' : 'Inflow within bounds',
      description: 'Ingress flow sensors active',
    },
    {
      label: 'Transport Status',
      value: stadiumStats.transportStatus,
      icon: Bus,
      accent: 'secondary' as const,
      trend: 'neutral' as const,
      trendLabel: 'Expressway Route C active',
      description: 'Metro and Shuttle Bus Hubs',
    },
    {
      label: 'Medical Units',
      value: stadiumStats.medicalStandby.toString(),
      icon: HeartPulse,
      accent: 'primary' as const,
      trend: 'neutral' as const,
      trendLabel: '3 dispatches active',
      description: 'On-site response teams',
    },
  ];

  return (
    <section
      aria-label="Quick statistics overview"
      className="grid grid-cols-2 lg:grid-cols-4 gap-(--card-gap)"
    >
      {metrics.map((metric) => (
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
