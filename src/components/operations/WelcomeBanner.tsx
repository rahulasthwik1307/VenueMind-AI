'use client';

import { Trophy, Calendar, ShieldAlert, Play, ArrowRight, Cloud } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIncident } from '@/hooks/useIncident';

const OPERATOR_NAME = 'Rahul Asthwik';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function WelcomeBanner() {
  const { incidents, analyses, setActiveIncidentId, telemetry } = useIncident();
  const greeting = getGreeting();
  
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Match Info calculations from live telemetry
  let matchPhaseLabel = 'Match In Ingress';
  let matchScoreLabel = 'Brazil vs Argentina · Al Bayt Stadium';
  let isLive = false;

  if (telemetry?.matchTimeline) {
    const { minute, period, score } = telemetry.matchTimeline.value;
    isLive = period === 'first-half' || period === 'second-half';
    
    if (period === 'pre-match') {
      matchPhaseLabel = `Match In Ingress (Kickoff in ${Math.abs(minute)}m)`;
    } else if (period === 'first-half') {
      matchPhaseLabel = `1st Half · ${minute}'`;
    } else if (period === 'halftime') {
      matchPhaseLabel = `Halftime Interval`;
    } else if (period === 'second-half') {
      matchPhaseLabel = `2nd Half · ${minute}'`;
    } else if (period === 'post-match') {
      matchPhaseLabel = `Post-Match (Egress Active)`;
    }
    
    matchScoreLabel = `Brazil ${score.home} - Argentina ${score.away} · Al Bayt Stadium`;
  }

  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const activeCount = incidents.filter(i => i.status !== 'resolved').length;

  // Sort active incidents by severity: critical > high > medium > low
  const sortedActive = [...incidents]
    .filter(i => i.status !== 'resolved')
    .sort((a, b) => {
      const weight = { critical: 4, high: 3, medium: 2, low: 1 };
      return weight[b.severity] - weight[a.severity];
    });

  const highestPriorityIncident = sortedActive[0];
  const primaryRec = highestPriorityIncident 
    ? analyses[highestPriorityIncident.id]?.recommendations.find(r => !r.executed && !r.dismissed)
    : null;

  const stadiumStatus = criticalCount > 0 
    ? `Level 2 Triage` 
    : activeCount > 0 
      ? `Level 1 Monitoring`
      : "Nominal Operations";

  const handleOpenHighestPriority = () => {
    if (highestPriorityIncident) {
      setActiveIncidentId(highestPriorityIncident.id);
    }
  };

  return (
    <div
      className={cn(
        'bg-(--surface-1) border border-(--border) rounded-card',
        'p-5 flex flex-col md:flex-row items-stretch justify-between gap-5'
      )}
      role="region"
      aria-label="Operations Briefing Console"
    >
      {/* Left Column: Greeting, Date, Match Info */}
      <div className="flex flex-col justify-between space-y-3 md:space-y-0 min-w-0 flex-1">
        <div>
          <p className="text-xs font-medium text-(--foreground-muted) uppercase tracking-wide" suppressHydrationWarning>
            {greeting}, Operator
          </p>
          <h1 className="text-xl font-bold text-(--foreground) leading-tight tracking-tight mt-0.5">
            {OPERATOR_NAME}
          </h1>
          <p className="text-xs text-(--foreground-subtle) mt-1.5 flex items-center gap-1.5" suppressHydrationWarning>
            <Calendar size={12} strokeWidth={1.75} aria-hidden="true" />
            {today}
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          {/* Live Match Info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded border border-(--border) bg-(--surface-2) w-fit">
            <div className="w-6 h-6 rounded-full bg-(--primary) flex items-center justify-center shrink-0">
              <Trophy size={12} className="text-white" />
            </div>
            <div className="text-[10px]">
              <p className="font-semibold text-(--foreground)">{matchPhaseLabel}</p>
              <p className="text-(--foreground-muted) opacity-80 font-mono">{matchScoreLabel}</p>
            </div>
            {isLive && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-(--primary) text-white live-indicator uppercase shrink-0">
                Live
              </span>
            )}
          </div>

          {/* Live Weather Info */}
          {telemetry?.weather && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-(--border) bg-(--surface-2) w-fit">
              <Cloud size={11} className="text-(--foreground-subtle) shrink-0" />
              <span className="text-[9px] font-semibold text-(--foreground) font-mono uppercase">
                {telemetry.weather.value.temperature}°C · {telemetry.weather.value.condition} · Wind {telemetry.weather.value.windSpeed} km/h
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Middle Column: Operational Briefing Summary */}
      <div className="flex-1 border-t md:border-t-0 md:border-l border-(--border) pt-4 md:pt-0 md:pl-5 flex flex-col justify-between">
        <div>
          <span className="text-[9px] font-bold text-(--foreground-muted) uppercase tracking-wider block">
            Command Center Briefing
          </span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[9px] text-(--foreground-subtle) uppercase block">Stadium Status</span>
              <span className={cn(
                'text-xs font-bold leading-tight uppercase',
                criticalCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-(--primary)'
              )}>
                {stadiumStatus}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-(--foreground-subtle) uppercase block">Triage Queue</span>
              <span className="text-xs font-bold text-(--foreground) font-mono">
                {activeCount} Active / {criticalCount} Critical
              </span>
            </div>
          </div>
        </div>

        {highestPriorityIncident ? (
          <div className="mt-4 bg-(--surface-2) p-2.5 rounded border border-(--border) text-[11px] leading-normal">
            <div className="flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-red-500 shrink-0" />
              <span className="font-bold text-(--foreground) truncate">
                AI Priority: {highestPriorityIncident.title}
              </span>
            </div>
            {primaryRec && (
              <p className="text-(--foreground-muted) mt-1 truncate">
                Rec: <span className="font-medium text-(--foreground)">{primaryRec.title}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 bg-(--surface-2) p-2.5 rounded border border-dashed border-(--border) text-[10px] text-center text-(--foreground-subtle)">
            All sectors reporting nominal. No priority incidents flagged.
          </div>
        )}
      </div>

      {/* Right Column: Active Navigation Button */}
      {highestPriorityIncident && (
        <div className="shrink-0 flex items-center md:justify-center border-t md:border-t-0 md:border-l border-(--border) pt-4 md:pt-0 md:pl-5">
          <button
            onClick={handleOpenHighestPriority}
            className={cn(
              'w-full md:w-auto flex items-center justify-center gap-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700',
              'px-4 py-3 rounded-md shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 group font-sans'
            )}
          >
            <Play size={12} className="fill-white" />
            <span>Triage Highest Priority</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
