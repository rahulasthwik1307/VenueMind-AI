'use client';

import { Video, Shield, Activity, Bus, HeartHandshake } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RelatedSystemsBadgesProps {
  systemStatus: {
    cctv: string;
    security: string;
    medical: string;
    transport: string;
    volunteer: string;
  };
}

export function RelatedSystemsBadges({ systemStatus }: RelatedSystemsBadgesProps) {
  return (
    <div className="border border-(--border) rounded-md p-4 bg-(--surface-2)">
      <h4 className="font-semibold mb-3 uppercase tracking-wider text-[10px] text-(--foreground-muted)">
        Related Operational Systems
      </h4>
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'CCTV Feed', value: systemStatus.cctv, icon: Video, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900' },
          { label: 'Security Unit', value: systemStatus.security, icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900' },
          { label: 'Medical Dispatch', value: systemStatus.medical, icon: Activity, color: 'text-red-600', bg: 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900' },
          { label: 'Transport Hub', value: systemStatus.transport, icon: Bus, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900' },
          { label: 'Volunteer Comm', value: systemStatus.volunteer, icon: HeartHandshake, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-900' },
        ].map((sys) => {
          const SysIcon = sys.icon;
          const isActive = sys.value !== 'Standby';
          return (
            <div
              key={sys.label}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[10px] font-semibold transition-all duration-150',
                isActive ? sys.bg : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-900/10 dark:border-gray-800'
              )}
            >
              <SysIcon size={11} className={isActive ? sys.color : 'text-gray-300'} />
              <span>{sys.label}:</span>
              <span className={cn('font-bold', isActive ? 'text-(--foreground)' : 'text-gray-400')}>
                {sys.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
