import { m } from 'framer-motion';
import { useIncidentStore } from '@/store/modules/incident';
import { cn } from '@/utils/cn';

export function CapacityWidget() {
  const telemetry = useIncidentStore((state) => state.telemetry);
  const occupancyPercent = telemetry?.stadiumCapacity.value ?? 62;
  const maxCapacity = 80000;
  const currentPax = maxCapacity * (occupancyPercent / 100);
  
  // SVG Gauge parameters
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - occupancyPercent / 100);

  return (
    <m.div
      className={cn(
        'flex items-center justify-center rounded-lg border border-(--border)',
        'bg-(--surface-1) shadow-xs select-none cursor-default',
        'w-8 h-8 sm:w-9.5 sm:h-9.5 p-0',
        'md:w-auto md:min-h-10.5 md:min-w-41 md:px-3 md:py-1.5 md:gap-5.5 md:justify-start'
      )}
      title={`Global Stadium Occupancy: ${occupancyPercent}% capacity`}
      role="img"
      aria-label={`Global Stadium Occupancy: ${occupancyPercent}%`}
      whileHover={{ boxShadow: 'var(--shadow-sm)', y: -1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Animated progress ring — larger and crisper */}
      <div className="relative w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90 select-none" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={radius}
            className="stroke-(--border-strong)"
            strokeWidth="3.2"
            fill="transparent"
          />
          <m.circle
            cx="18"
            cy="18"
            r={radius}
            className="stroke-(--primary)"
            strokeWidth="3.2"
            fill="transparent"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            strokeDasharray={circumference}
          />
        </svg>
        <span className="absolute text-[7px] sm:text-[8.5px] font-black font-mono text-(--foreground) leading-none select-none tracking-tighter">
          {occupancyPercent}%
        </span>
      </div>

      {/* Text block — hidden on mobile, shown md+ */}
      <div className="hidden md:flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[9px] font-bold text-(--foreground) opacity-80 uppercase tracking-widest leading-none">
            Capacity
          </span>
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
        </div>
        <span className="text-[11px] font-extrabold font-mono text-(--foreground) leading-none tracking-tight tabular-nums">
          {currentPax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          <span className="text-[9px] font-semibold text-(--foreground-muted) ml-0.5">pax</span>
        </span>
      </div>
    </m.div>
  );
}
