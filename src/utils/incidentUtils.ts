import {
  Shield,
  Activity,
  Users,
  Bus,
  Cloud,
  Building,
  HeartHandshake,
  Accessibility,
} from 'lucide-react';
import type { Incident } from '@/types/incident';
import type { Severity } from '@/types/common';

export const SEVERITY_STYLES: Record<Severity, { dot: string; text: string; bg: string; border: string }> = {
  critical: {
    dot: 'bg-red-600',
    text: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-100 dark:border-red-900',
  },
  high: {
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50/50 dark:bg-red-950/10',
    border: 'border-red-100/80 dark:border-red-950',
  },
  medium: {
    dot: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/15',
    border: 'border-yellow-100 dark:border-yellow-900/50',
  },
  low: {
    dot: 'bg-blue-400',
    text: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50/50 dark:bg-blue-950/10',
    border: 'border-blue-100/50 dark:border-blue-900/30',
  },
};

export const CATEGORY_ICONS: Record<Incident['category'], React.ComponentType<{ size: number; className?: string }>> = {
  crowd: Users,
  medical: Activity,
  security: Shield,
  infrastructure: Building,
  transport: Bus,
  weather: Cloud,
  volunteer: HeartHandshake,
  accessibility: Accessibility,
};

export function getTimeAgo(dateString: string): string {
  try {
    const now = new Date();
    const past = new Date(dateString);
    if (isNaN(past.getTime())) return '';
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}
