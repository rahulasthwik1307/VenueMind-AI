import { cn } from '@/utils/cn';

const OPERATOR_INITIALS = 'RA';

export function OperatorProfile() {
  return (
    <div className="hidden sm:block relative group shrink-0 select-none mr-1">
      <div
        className={cn(
          'w-8.5 h-8.5 rounded-full bg-linear-to-br from-(--primary) to-emerald-600',
          'flex items-center justify-center text-white text-[11px] font-extrabold shadow-xs',
          'border border-(--border-strong)/30',
          'group-hover:scale-105 group-hover:shadow-md transition-all duration-200 ease-out cursor-pointer'
        )}
        aria-label="User profile"
      >
        {OPERATOR_INITIALS}
      </div>
      {/* Live Status Online Indicator */}
      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-(--surface-1) shadow-xs animate-pulse" />
    </div>
  );
}
