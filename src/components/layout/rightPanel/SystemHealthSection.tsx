import { StatusBadge } from '@/components/shared/StatusBadge';
import { PanelSection } from './PanelSection';

export function SystemHealthSection() {
  const services = [
    { name: 'AI Engine', level: 'operational' as const },
    { name: 'CCTV Feed', level: 'operational' as const },
    { name: 'Transport API', level: 'degraded' as const },
    { name: 'Alert System', level: 'operational' as const },
  ];

  return (
    <PanelSection title="System Health">
      <ul className="space-y-1" aria-label="Service statuses">
        {services.map((svc) => (
          <li key={svc.name} className="flex items-center justify-between">
            <span className="text-xs text-(--foreground-muted)">{svc.name}</span>
            <StatusBadge level={svc.level} label={svc.level === 'operational' ? 'Online' : 'Degraded'} />
          </li>
        ))}
      </ul>
    </PanelSection>
  );
}
