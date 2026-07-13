'use client';

import { HEADER_HEIGHT } from '@/constants/layout';
import { cn } from '@/utils/cn';
import { HeaderBrand } from './HeaderBrand';
import { HeaderSearch } from './HeaderSearch';
import { HeaderActions } from './HeaderActions';

interface AppHeaderProps {
  onMobileMenuOpen?: () => void;
  onSearchOpen?: () => void;
}

export function AppHeader({ onMobileMenuOpen, onSearchOpen }: AppHeaderProps) {
  return (
    <header
      className={cn(
        'shrink-0 flex justify-between sm:grid sm:grid-cols-[1fr_minmax(0,480px)_1fr] items-center',
        'bg-(--surface-1) border-b border-(--border)',
        'px-2 sm:px-4 md:px-5',
        'z-20 sticky top-0'
      )}
      style={{ height: HEADER_HEIGHT }}
      role="banner"
    >
      <HeaderBrand onMobileMenuOpen={onMobileMenuOpen} />
      <HeaderSearch onSearchOpen={onSearchOpen} />
      <HeaderActions />
    </header>
  );
}
