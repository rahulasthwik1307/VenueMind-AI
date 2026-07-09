'use client';

import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, Cpu } from 'lucide-react';
import { cn } from '@/utils/cn';
import { NAV_GROUPS } from '@/constants/navigation';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/constants/layout';
import { SidebarNavGroup } from './SidebarNavGroup';

const OPERATOR = {
  name: 'Rahul Asthwik',
  role: 'Ops Manager',
  initials: 'RA',
} as const;

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
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)"
        aria-label="Sidebar navigation"
        tabIndex={0}
      >
        {NAV_GROUPS.map((group) => (
          <SidebarNavGroup key={group.id} group={group} collapsed={collapsed} />
        ))}
      </nav>

      {/* --- Footer Area --- */}
      <div
        className={cn(
          'shrink-0 border-t border-(--sidebar-border) bg-slate-950/15 p-3'
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-7 h-7 rounded-full bg-(--primary) flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
              aria-hidden="true"
            >
              {OPERATOR.initials}
            </div>
            <button
              onClick={() => setCollapsed(false)}
              className={cn(
                'flex items-center justify-center rounded-md p-1.5',
                'text-(--foreground-subtle) hover:bg-slate-950/20 hover:text-(--foreground)',
                'transition-colors duration-150 cursor-pointer',
                'focus-visible:outline-(--focus-ring)'
              )}
              aria-label="Expand sidebar"
              aria-expanded={false}
            >
              <PanelLeftOpen size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-full bg-(--primary) flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0"
                aria-hidden="true"
              >
                {OPERATOR.initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-(--foreground) truncate leading-tight">
                  {OPERATOR.name}
                </p>
                <p className="text-[9px] text-(--foreground-muted) uppercase tracking-wider font-semibold truncate leading-tight mt-0.5">
                  {OPERATOR.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className={cn(
                'flex items-center justify-center rounded-md p-1.5 shrink-0',
                'text-(--foreground-subtle) hover:bg-slate-950/20 hover:text-(--foreground)',
                'transition-colors duration-150 cursor-pointer',
                'focus-visible:outline-(--focus-ring)'
              )}
              aria-label="Collapse sidebar"
              aria-expanded={true}
            >
              <PanelLeftClose size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
