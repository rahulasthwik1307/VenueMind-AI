'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Cpu, Menu, X } from 'lucide-react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';

const NAV_ITEMS = [
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'technology', label: 'Technology' },
  { id: 'approach', label: 'Approach' },
] as const;

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const reduced = useReducedMotion();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Scroll listener for background transition & CTA reveal
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll state
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver to highlight current active section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies the upper-middle of viewport
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    // Clear active section when hero is visible
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection('');
          }
        });
      }, { root: null, rootMargin: '-10% 0px -90% 0px' });
      
      heroObserver.observe(heroEl);
      return () => {
        observer.disconnect();
        heroObserver.disconnect();
      };
    }

    return () => observer.disconnect();
  }, []);

  // Body scroll locking when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Smooth scroll handler
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      setMobileMenuOpen(false);
      const element = document.getElementById('hero');
      if (element) {
        element.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start',
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: reduced ? 'auto' : 'smooth',
        });
      }
    }
  };

  // Mobile menu stagger animation configurations
  const menuContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : 0.05,
        delayChildren: 0.08,
      },
    },
  };

  const menuItemVariants = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 350, damping: 25 },
    },
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 h-16',
          'flex items-center justify-between px-6 md:px-10',
          'transition-all duration-300 ease-in-out',
          scrolled
            ? 'bg-[--background]/95 border-b border-[--border] shadow-sm backdrop-blur-md'
            : 'bg-[--background]/80 border-b border-[--border] shadow-xs backdrop-blur-md'
        )}
        role="banner"
        aria-label="VenueMind AI site header"
      >
        {/* Brand logo/wordmark (Left Group) */}
        <Link
          href={ROUTES.landing}
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary] focus-visible:ring-offset-2 rounded-sm shrink-0"
          aria-label="VenueMind AI — home"
        >
          <div
            className="w-7 h-7 rounded-md bg-[--primary] flex items-center justify-center shrink-0 group-hover:brightness-110 transition-all duration-200"
            aria-hidden="true"
          >
            <Cpu size={14} strokeWidth={1.75} className="text-white" />
          </div>
          <span className="text-sm font-bold text-[--foreground] tracking-tight leading-none">
            VenueMind <span className="text-[--primary]">AI</span>
          </span>
        </Link>

        {/* Right Group: Navigation links & CTA button */}
        <div className="flex items-center gap-6 md:gap-8">
          {/* Desktop Nav Links */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollTo(e, item.id)}
                  className={cn(
                    'relative py-1 text-[13px] font-medium tracking-tight select-none transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary] rounded-sm',
                    isActive
                      ? 'text-[--foreground]'
                      : 'text-[--foreground-muted] hover:text-[--foreground]'
                  )}
                >
                  {item.label}
                  {isActive && !reduced && (
                    <m.span
                      layoutId="active-nav-line"
                      className="absolute bottom-[-6px] left-1.5 right-1.5 h-[1.5px] bg-[--primary] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {isActive && reduced && (
                    <span className="absolute bottom-[-6px] left-1.5 right-1.5 h-[1.5px] bg-[--primary] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop CTA (Visible immediately, with border, ring outline, brand shadow and hover lift) */}
          <div className="hidden md:block">
            <Link
              href={ROUTES.dashboard}
              className={cn(
                'inline-flex items-center justify-center px-4.5 py-2 text-xs font-bold rounded-lg',
                'bg-[--primary] text-white select-none ring-1 ring-white/10 border border-[--primary-hover]',
                'hover:brightness-110 hover:-translate-y-[1px] active:scale-[0.98]',
                'transition-all duration-200 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                'shadow-[0_4px_12px_rgba(15,81,50,0.18)] dark:shadow-[0_4px_12px_rgba(16,185,129,0.18)] hover:shadow-[0_6px_16px_rgba(15,81,50,0.28)] dark:hover:shadow-[0_6px_16px_rgba(16,185,129,0.28)]'
              )}
            >
              Enter Command Center
            </Link>
          </div>

          {/* Mobile CTA (Visible immediately, next to hamburger) */}
          <div className="md:hidden">
            <Link
              href={ROUTES.dashboard}
              className={cn(
                'inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-semibold rounded-md',
                'bg-[--primary] text-white ring-1 ring-white/10 border border-[--primary-hover]',
                'hover:brightness-110 active:scale-[0.98] transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary]',
                'shadow-[0_2px_6px_rgba(15,81,50,0.12)] dark:shadow-[0_2px_6px_rgba(16,185,129,0.12)]'
              )}
            >
              Enter Command Center
            </Link>
          </div>

          {/* Hamburger Menu Toggle (Mobile with rotate transitions) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'md:hidden flex items-center justify-center w-10 h-10 rounded-md border border-transparent',
              'text-[--foreground-muted] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary]'
            )}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <m.div
                animate={{ rotate: mobileMenuOpen ? 90 : 0, opacity: mobileMenuOpen ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Menu size={20} />
              </m.div>
              <m.div
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: mobileMenuOpen ? 0 : -90, opacity: mobileMenuOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <X size={20} />
              </m.div>
            </div>
          </button>
        </div>
      </header>

      {/* Slide-down Mobile Navigation Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div
            id="mobile-nav-panel"
            ref={mobileMenuRef}
            initial={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-16 left-0 right-0 z-30 bg-[--background]/98 border-b border-[--border] shadow-lg md:hidden overflow-hidden backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation panel"
          >
            <m.nav
              variants={menuContainerVariants}
              initial="hidden"
              animate="show"
              className="px-6 py-6 flex flex-col gap-4"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <m.a
                    key={item.id}
                    variants={menuItemVariants}
                    href={`#${item.id}`}
                    onClick={(e) => handleScrollTo(e, item.id)}
                    className={cn(
                      'text-xs font-bold uppercase tracking-widest py-3 border-b border-[--border]/40 flex items-center justify-between',
                      'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary] rounded-xs',
                      isActive ? 'text-[--primary]' : 'text-[--foreground-muted] hover:text-[--foreground]'
                    )}
                  >
                    <span>{item.label}</span>
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full transition-all duration-200',
                        isActive ? 'bg-[--primary] scale-100' : 'bg-transparent scale-0'
                      )}
                    />
                  </m.a>
                );
              })}
              
              <m.div variants={menuItemVariants} className="mt-2">
                <Link
                  href={ROUTES.dashboard}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'w-full flex items-center justify-center py-3.5 px-4 rounded-lg',
                    'bg-[--primary] text-white text-xs font-semibold shadow-sm ring-1 ring-white/10 border border-[--primary-hover]',
                    'hover:brightness-110 active:scale-[0.98] transition-all duration-150'
                  )}
                >
                  Enter Command Center
                </Link>
              </m.div>
            </m.nav>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
