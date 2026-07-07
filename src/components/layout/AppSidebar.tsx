'use client';

import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, Cpu, Wifi } from 'lucide-react';
import { cn } from '@/utils/cn';
import { NAV_GROUPS } from '@/constants/navigation';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/constants/layout';
import { SidebarNavGroup } from './SidebarNavGroup';
import { StatusBadge } from '@/components/shared/StatusBadge';

const OPERATOR = {
  name: 'Rahul Asthwik',
  role: 'Ops Manager',
  initials: 'RA',
} as const;

const SYSTEM_VERSION = 'v0.2.0 · Stage 2';

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0',
        'bg-(--sidebar-bg) border-r border-(--sidebar-border)',
        'transition-[width] duration-200 ease-out overflow-hidden',
        'relative z-10'
      )}
      style={{ width: sidebarWidth }}
      aria-label="Main navigation"
      role="navigation"
    >
      {/* --- Logo Area --- */}
      <div
        className={cn(
          'flex items-center border-b border-(--sidebar-border)',
          'h-(--header-height) shrink-0',
          collapsed ? 'justify-center px-2' : 'gap-2.5 px-4'
        )}
      >
        {/* Logo mark */}
        <div
          className="w-7 h-7 rounded-sm bg-(--primary) flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Cpu size={14} strokeWidth={1.75} className="text-white" />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <span className="text-sm font-bold text-(--foreground) leading-none tracking-tight">
              VenueMind
            </span>
            <span className="text-sm font-bold text-(--primary) leading-none tracking-tight">
              {' '}AI
            </span>
          </div>
        )}
      </div>

      {/* --- Navigation Groups --- */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-5" aria-label="Sidebar navigation">
        {NAV_GROUPS.map((group) => (
          <SidebarNavGroup key={group.id} group={group} collapsed={collapsed} />
        ))}
      </nav>

      {/* --- Footer Area --- */}
      <div
        className={cn(
          'shrink-0 border-t border-(--sidebar-border) p-2 space-y-2'
        )}
      >
        {/* System Status */}
        {!collapsed && (
          <div className="px-2 py-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-(--foreground-subtle) uppercase tracking-widest">
                System
              </span>
              <StatusBadge level="operational" label="Operational" />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Wifi size={11} strokeWidth={1.75} className="text-green-500 shrink-0" aria-hidden="true" />
              <span className="text-[10px] text-(--foreground-subtle) truncate">
                All services online
              </span>
            </div>
          </div>
        )}

        {/* Operator Info */}
        <div
          className={cn(
            'flex items-center rounded-md px-2 py-2',
            'hover:bg-(--sidebar-item-hover) transition-colors duration-150',
            collapsed ? 'justify-center' : 'gap-2.5'
          )}
        >
          <div
            className="w-7 h-7 rounded-full bg-(--primary) flex items-center justify-center shrink-0 text-white text-[10px] font-bold"
            aria-hidden="true"
          >
            {OPERATOR.initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-(--foreground) truncate leading-tight">
                {OPERATOR.name}
              </p>
              <p className="text-[10px] text-(--foreground-muted) truncate leading-tight">
                {OPERATOR.role}
              </p>
            </div>
          )}
        </div>

        {/* Version */}
        {!collapsed && (
          <p className="px-2 text-[9px] text-(--foreground-subtle) font-mono">
            {SYSTEM_VERSION}
          </p>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className={cn(
            'flex w-full items-center rounded-md px-2 py-2',
            'text-(--foreground-subtle) hover:bg-(--sidebar-item-hover) hover:text-(--foreground)',
            'transition-colors duration-150',
            'focus-visible:outline-(--focus-ring)',
            collapsed ? 'justify-center' : 'gap-2.5'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeftOpen size={15} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={15} strokeWidth={1.75} aria-hidden="true" />
          )}
          {!collapsed && (
            <span className="text-xs">Collapse</span>
          )}
        </button>
      </div>
    </aside>
  );
}
