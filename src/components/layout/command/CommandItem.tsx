import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Incident } from '@/types/incident';

export interface NavResult {
  kind: 'nav';
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group: string;
}

export interface IncidentResult {
  kind: 'incident';
  id: string;
  label: string;
  subtitle: string;
  severity: Incident['severity'];
  status: Incident['status'];
}

export type CommandResult = NavResult | IncidentResult;

const SEVERITY_DOT: Record<Incident['severity'], string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-400',
  low: 'bg-emerald-500',
};

const SEVERITY_LABEL: Record<Incident['severity'], string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const STATUS_CLASSES: Record<Incident['status'], string> = {
  open: 'text-red-500',
  investigating: 'text-amber-500',
  mitigated: 'text-blue-500',
  resolved: 'text-emerald-500',
};

interface CommandItemProps {
  result: CommandResult;
  isActive: boolean;
  index: number;
  onMouseEnter: () => void;
  onMouseDown: () => void;
  showIncidentHeader?: boolean;
}

export function CommandItem({
  result,
  isActive,
  index,
  onMouseEnter,
  onMouseDown,
  showIncidentHeader,
}: CommandItemProps) {
  return (
    <li
      id={`cmd-result-${result.id}`}
      data-index={index}
      role="option"
      aria-selected={isActive}
      onMouseEnter={onMouseEnter}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown();
      }}
      className="cursor-pointer"
    >
      {showIncidentHeader && (
        <div className="px-2 pt-3 pb-0.5" aria-hidden="true">
          <span className="text-[9px] font-bold uppercase tracking-widest text-(--foreground-subtle)">
            Incidents
          </span>
        </div>
      )}

      {result.kind === 'nav' ? (
        <NavResultRow result={result} isActive={isActive} />
      ) : (
        <IncidentResultRow result={result} isActive={isActive} />
      )}
    </li>
  );
}

function NavResultRow({ result, isActive }: { result: NavResult; isActive: boolean }) {
  const Icon = result.icon;
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors duration-100',
        isActive
          ? 'bg-(--primary-muted) text-(--primary)'
          : 'text-(--foreground-muted) hover:bg-(--surface-2)',
      )}
    >
      <div
        className={cn(
          'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
          isActive ? 'bg-(--primary)/15' : 'bg-(--surface-2)',
        )}
      >
        <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{result.label}</p>
        <p className="text-[9px] text-(--foreground-subtle) truncate">{result.group}</p>
      </div>
      <ArrowRight
        size={12}
        className={cn('shrink-0 opacity-0 transition-opacity', isActive && 'opacity-60')}
        aria-hidden="true"
      />
    </div>
  );
}

function IncidentResultRow({ result, isActive }: { result: IncidentResult; isActive: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors duration-100',
        isActive
          ? 'bg-(--primary-muted) text-(--primary)'
          : 'text-(--foreground-muted) hover:bg-(--surface-2)',
      )}
    >
      {/* Severity dot */}
      <div className="shrink-0 flex items-center justify-center w-7 h-7">
        <span
          className={cn('w-2 h-2 rounded-full shrink-0', SEVERITY_DOT[result.severity])}
          aria-label={SEVERITY_LABEL[result.severity]}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{result.label}</p>
        <p className="text-[9px] text-(--foreground-subtle) truncate">{result.subtitle}</p>
      </div>

      <span
        className={cn(
          'shrink-0 text-[9px] font-semibold font-mono uppercase',
          STATUS_CLASSES[result.status],
        )}
      >
        {result.status}
      </span>
    </div>
  );
}
