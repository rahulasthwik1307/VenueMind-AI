import { Menu, Cpu } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HeaderBrandProps {
  onMobileMenuOpen?: () => void;
}

export function HeaderBrand({ onMobileMenuOpen }: HeaderBrandProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuOpen}
        className={cn(
          'md:hidden flex items-center justify-center w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-lg border border-(--border)',
          'bg-(--surface-1) text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-2)',
          'transition-all duration-200 focus-visible:ring-2 focus-visible:ring-(--primary-muted)/40 focus-visible:outline-none'
        )}
        aria-label="Open navigation menu"
        aria-haspopup="dialog"
      >
        <Menu size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {/* Mobile Logo */}
      <div className="flex items-center gap-2 md:hidden">
        <div
          className="w-6 h-6 rounded-sm bg-(--primary) flex items-center justify-center"
          aria-hidden="true"
        >
          <Cpu size={12} strokeWidth={1.75} className="text-white" />
        </div>
        <span className="text-sm font-bold text-(--foreground) leading-none">
          VenueMind <span className="text-(--primary)">AI</span>
        </span>
      </div>

      {/* Desktop — Primary operational branding */}
      <div className="hidden md:flex items-center select-none whitespace-nowrap shrink-0">
        <span className="text-[16px] font-bold text-(--foreground) tracking-tight">
          Stadium Operations
        </span>
        <div className="w-px h-5 bg-(--border-strong) mx-1.5 lg:mx-2.5 opacity-60" aria-hidden="true" />
        <span className="text-[13px] font-medium text-(--foreground-subtle) tracking-wide">
          FIFA World Cup 2026
        </span>
      </div>
    </div>
  );
}
