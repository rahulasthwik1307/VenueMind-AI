import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HeaderSearchProps {
  onSearchOpen?: () => void;
}

export function HeaderSearch({ onSearchOpen }: HeaderSearchProps) {
  return (
    <div className="w-full hidden sm:block -ml-8 pl-0 pr-3 lg:-ml-12 group">
      <button
        type="button"
        onClick={onSearchOpen}
        className={cn(
          'w-full pl-10 pr-12 h-9.5 text-xs text-left relative flex items-center',
          'bg-(--surface-2) border border-(--border)',
          'rounded-lg text-(--foreground-subtle)/70',
          'hover:bg-(--surface-3)/45 hover:border-(--border-strong) cursor-pointer',
          'shadow-xs transition-all duration-200 ease-in-out',
          'focus-visible:outline-(--focus-ring)'
        )}
        aria-label="Open global search command palette"
      >
        <Search
          size={14}
          className="absolute left-3.5 text-(--foreground-subtle)"
          aria-hidden="true"
        />
        <span className="truncate">Search incidents, alerts, or operations...</span>
        <kbd
          className="hidden lg:flex absolute right-3 items-center justify-center h-5.5 px-1.5 rounded bg-(--surface-3) border border-(--border-strong)/30 text-[9px] font-medium font-mono text-(--foreground-subtle) select-none pointer-events-none"
          aria-hidden="true"
        >
          ⌘K
        </kbd>
      </button>
    </div>
  );
}
