import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { useIncidentStore } from '@/store/modules/incident';
import { cn } from '@/utils/cn';
import { PanelSection } from './PanelSection';

export function QuickActionsSection() {
  const { addToast, addActivity } = useIncidentStore();
  const actions = [
    {
      id: 'deploy',
      label: 'Deploy Security Team',
      severity: 'high' as const,
      msg: 'Quick Action: Security Team dispatch initiated via Operations Panel',
      icon: Shield,
      borderColor: 'border-l-orange-500',
      iconColor: 'text-orange-500',
    },
    {
      id: 'alert',
      label: 'Broadcast Alert',
      severity: 'high' as const,
      msg: 'Quick Action: Global stadium warning broadcasted',
      icon: AlertTriangle,
      borderColor: 'border-l-red-500',
      iconColor: 'text-red-500',
    },
    {
      id: 'close-gate',
      label: 'Close Gate Section',
      severity: 'medium' as const,
      msg: 'Quick Action: Tactical gate closure sequence engaged',
      icon: Lock,
      borderColor: 'border-l-blue-500',
      iconColor: 'text-blue-500',
    },
  ];

  const handleAction = (label: string, severity: 'low' | 'medium' | 'high' | 'critical', msg: string) => {
    addToast(`${label} action dispatched`, 'success');
    addActivity(msg, 'Operations Center', severity);
  };

  return (
    <PanelSection title="Quick Actions" className="py-2">
      <div className="space-y-1.5">
        {actions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.label, action.severity, action.msg)}
              className={cn(
                'w-full flex items-center gap-2 text-left text-xs font-semibold px-2.5 py-1.5 rounded-sm cursor-pointer',
                'border border-(--border) border-l-3 bg-(--surface-2) text-(--foreground-muted)',
                action.borderColor,
                'hover:bg-(--surface-3) hover:border-(--border-strong) hover:text-(--foreground)',
                'transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)'
              )}
              aria-label={action.label}
            >
              <ActionIcon size={12} className={cn('shrink-0', action.iconColor)} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </PanelSection>
  );
}
