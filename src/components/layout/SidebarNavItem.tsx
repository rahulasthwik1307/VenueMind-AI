'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import type { NavItem } from '@/constants/navigation';

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
}

export function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const pathname = usePathname();

  const isActive =
    item.href === '/dashboard'
      ? pathname === '/' || pathname === '/dashboard'
      : pathname.startsWith(item.href);

  const inner = (
    <span
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md',
        'text-sm font-medium transition-all duration-150',
        'group min-h-11',
        isActive
          ? 'bg-(--sidebar-item-active-bg) text-(--sidebar-item-active-text)'
          : 'text-(--foreground-muted) hover:bg-(--sidebar-item-hover) hover:text-(--foreground)',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      {/* Active indicator bar */}
      {isActive && !collapsed && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-(--primary) rounded-r-full"
          aria-hidden="true"
        />
      )}

      <item.icon
        size={17}
        strokeWidth={isActive ? 2 : 1.75}
        aria-hidden="true"
        className={cn(
          'shrink-0 transition-colors duration-150',
          isActive ? 'text-(--primary)' : 'text-current'
        )}
      />

      {!collapsed && (
        <span className="truncate leading-none">{item.label}</span>
      )}

      {!collapsed && item.badge !== undefined && item.badge > 0 && (
        <span
          className="ml-auto text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full bg-(--color-error) text-white min-w-4.5 text-center"
          aria-label={`${item.badge} items`}
        >
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </span>
  );

  const commonProps = {
    className: 'relative block w-full',
    'aria-label': collapsed ? item.label : undefined,
    'aria-current': isActive ? ('page' as const) : undefined,
  };

  if (item.placeholder) {
    return (
      <li>
        <button
          {...commonProps}
          type="button"
          aria-disabled="true"
          title={item.placeholder ? `${item.label} — coming in next stage` : undefined}
          onClick={() => undefined}
          tabIndex={0}
        >
          {inner}
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link href={item.href} {...commonProps}>
        {inner}
      </Link>
    </li>
  );
}
