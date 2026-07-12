'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { X, Cpu, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';
import { NAV_GROUPS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { SidebarNavGroup } from './SidebarNavGroup';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface MobileSidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebarOverlay({ isOpen, onClose }: MobileSidebarOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleExit = () => {
    onClose();
    router.push(ROUTES.landing);
  };

  const handleNavItemClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      onClose();
      return;
    }
    e.preventDefault();
    onClose();
    setTimeout(() => {
      router.push(href);
    }, 250);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus close button on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <m.nav
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { x: '-100%', transition: { duration: 0.25, ease: 'easeIn' } },
              visible: { 
                x: 0, 
                transition: { 
                  type: 'spring', damping: 28, stiffness: 250,
                  staggerChildren: 0.05, delayChildren: 0.05
                } 
              }
            }}
            className={cn(
              'relative z-10 flex flex-col w-72 h-full',
              'bg-(--sidebar-bg) shadow-(--shadow-lg)'
            )}
            aria-label="Mobile navigation"
          >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--sidebar-border) h-(--header-height)">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-sm bg-(--primary) flex items-center justify-center"
              aria-hidden="true"
            >
              <Cpu size={14} strokeWidth={1.75} className="text-white" />
            </div>
            <span className="text-sm font-bold text-(--foreground)">
              VenueMind <span className="text-(--primary)">AI</span>
            </span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-md',
              'text-(--foreground-muted) hover:bg-(--surface-3) hover:text-(--foreground)',
              'transition-colors duration-150'
            )}
            aria-label="Close navigation menu"
          >
            <X size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
            {NAV_GROUPS.map((group) => (
              <SidebarNavGroup key={group.id} group={group} collapsed={false} onItemClick={handleNavItemClick} />
            ))}
          </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-(--sidebar-border) space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-(--foreground-subtle) uppercase tracking-widest font-semibold">
              System
            </span>
            <StatusBadge level="operational" label="Operational" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-7 h-7 rounded-full bg-(--primary) flex items-center justify-center text-white text-[10px] font-bold"
              aria-hidden="true"
            >
              RA
            </div>
            <div>
              <p className="text-xs font-semibold text-(--foreground)">Rahul Asthwik</p>
              <p className="text-[10px] text-(--foreground-muted)">Ops Manager</p>
            </div>
          </div>
            {/* Exit button — returns to landing page */}
            <button
              onClick={handleExit}
              className={cn(
                'w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-md',
                'text-xs font-medium text-(--foreground-subtle)',
                'hover:bg-(--surface-2) hover:text-(--foreground)',
                'border border-(--border)',
                'transition-colors duration-150 cursor-pointer',
                'focus-visible:outline-(--focus-ring)'
              )}
              aria-label="Return to landing page"
            >
              <LogOut size={13} strokeWidth={1.75} aria-hidden="true" />
              Exit
            </button>
          </div>
        </m.nav>
      </div>
      )}
    </AnimatePresence>
  );
}
