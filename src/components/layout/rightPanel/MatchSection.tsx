import { useIncidentStore } from '@/store/modules/incident';
import { SkeletonLine } from '@/components/shared/SkeletonLine';
import { PanelSection } from './PanelSection';

export function MatchSection() {
  const telemetry = useIncidentStore((state) => state.telemetry);

  // Extract match minute and occupancy
  const matchMinute = telemetry?.matchTimeline?.value?.minute ?? 0;
  const period = telemetry?.matchTimeline?.value?.period ?? 'pre-match';
  const occupancyPercent = telemetry?.stadiumCapacity?.value ?? 0;

  // Calculate match time progress (max 90 minutes)
  const matchProgress = Math.min(100, Math.max(0, (matchMinute / 90) * 100));

  // Determine display values for stats grid
  const attendance = telemetry 
    ? Math.round(80000 * (occupancyPercent / 100)).toLocaleString() 
    : '87,432';
  const capacityLabel = telemetry 
    ? `${occupancyPercent}%` 
    : '92%';
  
  let minLabel = '67′';
  if (telemetry) {
    if (period === 'pre-match') {
      minLabel = 'Pre-M';
    } else if (period === 'halftime') {
      minLabel = 'HT';
    } else if (period === 'post-match') {
      minLabel = 'FT';
    } else {
      minLabel = `${matchMinute}′`;
    }
  }

  return (
    <PanelSection title="Current Match">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-(--foreground)">
            Brazil vs Argentina
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 live-indicator">
            LIVE
          </span>
        </div>

        {telemetry ? (
          <div className="space-y-1.5 mt-1">
            {/* Match Time Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-(--foreground-muted) font-mono">
                <span>Match Time</span>
                <span>{period === 'pre-match' ? 'Ingress' : `${Math.max(0, matchMinute)}′ / 90′`}</span>
              </div>
              <div className="w-full bg-(--surface-3) rounded-full h-1.5 overflow-hidden border border-(--border)">
                <div
                  className="bg-(--primary) h-full rounded-full transition-all duration-500"
                  style={{ width: `${matchProgress}%` }}
                />
              </div>
            </div>

            {/* Capacity Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-(--foreground-muted) font-mono">
                <span>Stadium Capacity</span>
                <span>{occupancyPercent}%</span>
              </div>
              <div className="w-full bg-(--surface-3) rounded-full h-1.5 overflow-hidden border border-(--border)">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <SkeletonLine width="3/4" className="h-2.5" />
              <SkeletonLine width="1/2" className="h-2" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1 text-center mt-2">
          {[
            { label: 'Attendance', value: attendance },
            { label: 'Capacity', value: capacityLabel },
            { label: 'Min', value: minLabel },
          ].map((stat) => (
            <div key={stat.label} className="bg-(--surface-2) rounded-sm py-1 px-1.5">
              <p className="text-[11px] font-bold text-(--foreground) font-mono tabular-nums">
                {stat.value}
              </p>
              <p className="text-[9px] text-(--foreground-subtle) leading-tight mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PanelSection>
  );
}
