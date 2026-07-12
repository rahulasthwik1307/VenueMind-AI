import type { NavGroup } from '@/constants/navigation';
import { SidebarNavItem } from './SidebarNavItem';

interface SidebarNavGroupProps {
  group: NavGroup;
  collapsed: boolean;
  onItemClick?: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export function SidebarNavGroup({ group, collapsed, onItemClick }: SidebarNavGroupProps) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <p
          className="px-3 mb-1 text-[10px] font-semibold text-(--foreground-subtle) uppercase tracking-widest"
          aria-label={`Navigation group: ${group.label}`}
        >
          {group.label}
        </p>
      )}
      <ul role="list" aria-label={group.label} className="space-y-0.5">
        {group.items.map((item) => (
          <SidebarNavItem key={item.id} item={item} collapsed={collapsed} onItemClick={onItemClick} />
        ))}
      </ul>
    </div>
  );
}
