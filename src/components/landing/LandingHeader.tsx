'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cpu, Layers, Cpu as TechIcon, Compass } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';
import { NavBar } from '@/components/ui/tubelight-navbar';

const NAV_ITEMS = [
  { id: 'technology', label: 'Technology', icon: TechIcon },
  { id: 'capabilities', label: 'Capabilities', icon: Layers },
  { id: 'approach', label: 'Approach', icon: Compass },
] as const;

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const reduced = useReducedMotion();

  // Scroll listener for background transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver to highlight current active section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-25% 0px -45% 0px', // 30% band in the upper-middle of the viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'hero') {
            setActiveSection('');
          } else {
            setActiveSection(id);
          }
        }
      });
    }, observerOptions);

    const sections = ['hero', 'capabilities', 'technology', 'approach'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Smooth scroll handler
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    
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

  // Construct items for tubelight navbar
  const navItems = NAV_ITEMS.map((item) => ({
    name: item.label,
    url: `#${item.id}`,
    icon: item.icon,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleScrollTo(e, item.id)
  }));

  const activeTab = activeSection
    ? (NAV_ITEMS.find((n) => n.id === activeSection)?.label || '')
    : '';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 h-16',
        'flex items-center justify-between px-3 sm:px-6 md:px-10',
        'transition-all duration-300 ease-in-out',
        scrolled
          ? 'bg-background/95 border-b border-border shadow-sm backdrop-blur-md'
          : 'bg-background/80 border-b border-border shadow-xs backdrop-blur-md'
      )}
      role="banner"
      aria-label="VenueMind AI site header"
    >
      {/* Brand logo/wordmark (Left Group) */}
      <Link
        href={ROUTES.landing}
        onClick={handleLogoClick}
        className="flex items-center gap-2 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm shrink-0 animate-fade-in"
        aria-label="VenueMind AI — home"
      >
        <div
          className={cn(
            "w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-lg bg-primary flex items-center justify-center shrink-0",
            "group-hover:brightness-110 active:scale-95 transition-all duration-200",
            "border border-primary-hover/20 dark:border-primary/30",
            "shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.25)]"
          )}
          aria-hidden="true"
        >
          <Cpu size={16} strokeWidth={2.25} className="text-white dark:text-[#0b0f19] transition-transform duration-200 group-hover:scale-105 sm:w-4.5 sm:h-4.5" />
        </div>
        <span className="text-sm sm:text-base font-extrabold text-foreground tracking-tight leading-none">
          VenueMind <span className="text-primary">AI</span>
        </span>
      </Link>

      {/* Right Group: Navigation Links and CTA */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <NavBar
          items={navItems}
          activeTab={activeTab}
          onTabChange={(name: string) => {
            const item = NAV_ITEMS.find((n) => n.label === name);
            if (item) {
              const el = document.getElementById(item.id);
              if (el) {
                el.scrollIntoView({
                  behavior: reduced ? 'auto' : 'smooth',
                  block: 'start',
                });
              }
            }
          }}
          className="relative top-auto left-auto transform-none mb-0 pt-0 sm:pt-0 z-10"
        />
        
        <Link
          href={ROUTES.dashboard}
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-primary text-white dark:text-[#0b0f19] font-black select-none shrink-0',
            'px-2.5 sm:px-4.5 py-1.5 text-[10px] sm:text-xs border border-primary-hover ring-1 ring-white/10',
            'hover:brightness-115 hover:-translate-y-px active:scale-[0.98] transition-all duration-200',
            'shadow-[0_4px_12px_rgba(15,81,50,0.25)] dark:shadow-[0_4px_12px_rgba(16,185,129,0.35)]'
          )}
        >
          <span className="hidden sm:inline">Enter Command Center</span>
          <span className="sm:hidden">Command Center</span>
        </Link>
      </div>
    </header>
  );
}
