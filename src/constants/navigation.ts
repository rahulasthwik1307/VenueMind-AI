/**
 * Navigation items for the VenueMind AI sidebar.
 *
 * Stage 2: Navigation items are defined as placeholders.
 * Routes that do not yet have pages are marked as `placeholder: true`.
 * They render correctly in the sidebar but do not navigate to dead routes.
 */

import {
  LayoutDashboard,
  AlertTriangle,
  Brain,
  Map,
  Users,
  Bus,
  ShieldAlert,
  HelpingHand,
  Clock,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from './routes';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  placeholder?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'core',
    label: 'Operations',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: ROUTES.dashboard,
        icon: LayoutDashboard,
      },
      {
        id: 'incidents',
        label: 'Live Incidents',
        href: ROUTES.incidents,
        icon: AlertTriangle,
      },
      {
        id: 'ai-command',
        label: 'AI Command Center',
        href: ROUTES.aiCommand,
        icon: Brain,
      },
      {
        id: 'map',
        label: 'Interactive Map',
        href: ROUTES.map,
        icon: Map,
      },
    ],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    items: [
      {
        id: 'crowd',
        label: 'Crowd Monitoring',
        href: ROUTES.crowd,
        icon: Users,
      },
      {
        id: 'transport',
        label: 'Transport',
        href: ROUTES.transport,
        icon: Bus,
      },
      {
        id: 'emergency',
        label: 'Emergency',
        href: ROUTES.emergency,
        icon: ShieldAlert,
      },
      {
        id: 'accessibility',
        label: 'Accessibility',
        href: ROUTES.accessibility,
        icon: HelpingHand,
      },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      {
        id: 'timeline',
        label: 'Ops Timeline',
        href: ROUTES.timeline,
        icon: Clock,
      },
      {
        id: 'settings',
        label: 'Settings',
        href: ROUTES.settings,
        icon: Settings,
      },
    ],
  },
];
