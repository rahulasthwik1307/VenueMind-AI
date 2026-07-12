'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m } from 'framer-motion';
import { cn } from '@/utils/cn';
import { computeIsActive } from '@/utils/navIsActive';
import type { NavItem } from '@/constants/navigation';

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  onItemClick?: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export function SidebarNavItem({ item, collapsed, onItemClick }: SidebarNavItemProps) {
  const pathname = usePathname();

  const isActive = computeIsActive(item.href, pathname);

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

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  };

  if (item.placeholder) {
    return (
      <m.li variants={itemVariants}>
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
      </m.li>
    );
  }

  return (
    <m.li variants={itemVariants}>
      <Link href={item.href} {...commonProps} onClick={(e) => onItemClick?.(e, item.href)}>
        {inner}
      </Link>
    </m.li>
  );
}
