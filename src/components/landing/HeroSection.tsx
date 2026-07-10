'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink, ShieldAlert, Activity, Users, Zap } from 'lucide-react';
import { m, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';

/** Ambient radar sweep — pure CSS SVG animation. Respects prefers-reduced-motion. */
function AmbientBackground({ reduced }: { reduced: boolean }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Subtle pitch-line grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.028]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="pitch-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#0f5132" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pitch-grid)" />
      </svg>

      {/* Slow radar sweep arcs */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2"
        style={{
          animation: reduced ? 'none' : 'radarSpin 30s linear infinite',
          transformOrigin: 'center center',
        }}
      >
        <svg width="700" height="700" viewBox="0 0 700 700" className="opacity-[0.04]">
          <circle cx="350" cy="350" r="100" fill="none" stroke="#0f5132" strokeWidth="1" />
          <circle cx="350" cy="350" r="200" fill="none" stroke="#0f5132" strokeWidth="0.8" />
          <circle cx="350" cy="350" r="300" fill="none" stroke="#0f5132" strokeWidth="0.6" />
          <line x1="350" y1="350" x2="650" y2="350" stroke="#0f5132" strokeWidth="0.8" opacity="0.6" />
        </svg>
      </div>

      <style>{`
        @keyframes radarSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/** Stylized product UI preview — faithful mini-recreation using real design tokens */
function ProductPreview() {
  return (
    <div
      className={cn(
        'relative rounded-[--radius-card] border border-black/8',
        'bg-[--surface-1] shadow-[0_8px_40px_rgba(0,0,0,0.10)]',
        'overflow-hidden w-full max-w-130'
      )}
      aria-hidden="true"
      role="img"
      aria-label="VenueMind AI dashboard preview"
    >
      {/* Faux app header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/6 bg-[--surface-1]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[4px] bg-[--primary] flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">VM</span>
          </div>
          <span className="text-[11px] font-semibold text-[--foreground]">Command Center</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono text-[--foreground-muted]">LIVE</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-px bg-black/4 border-b border-black/6">
        {[
          { label: 'Crowd Density', value: '74%', color: 'text-amber-600', Icon: Users },
          { label: 'Active Incidents', value: '3', color: 'text-red-600', Icon: ShieldAlert },
          { label: 'AI Confidence', value: '96%', color: 'text-[--primary]', Icon: Zap },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="bg-[--surface-1] px-3 py-2.5">
            <div className="flex items-center gap-1 mb-1">
              <Icon size={9} className={cn('shrink-0', color)} />
              <span className="text-[8px] text-[--foreground-subtle] uppercase tracking-wide truncate">{label}</span>
            </div>
            <span className={cn('text-base font-bold leading-none', color)}>{value}</span>
          </div>
        ))}
      </div>

      {/* Incident cards */}
      <div className="p-3 space-y-2">
        {[
          { severity: 'critical', title: 'Gate 7 Crowd Surge — Sector C', zone: 'Zone C · Security', time: '2m ago' },
          { severity: 'high', title: 'Medical Unit Request — North Stand', zone: 'Medical · Zone N', time: '5m ago' },
          { severity: 'medium', title: 'Transport Delay — Bus Route 4', zone: 'Transport · Lot B', time: '11m ago' },
        ].map(({ severity, title, zone, time }) => (
          <div
            key={title}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg border',
              'bg-[--surface-2] border-black/5'
            )}
          >
            <span
              className={cn(
                'shrink-0 w-1.5 h-1.5 rounded-full',
                severity === 'critical' ? 'bg-red-500' :
                severity === 'high' ? 'bg-amber-500' : 'bg-yellow-400'
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-[--foreground] truncate">{title}</p>
              <p className="text-[8px] text-[--foreground-subtle] mt-0.5">{zone}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Activity size={9} className="text-[--foreground-subtle]" />
              <span className="text-[8px] font-mono text-[--foreground-subtle]">{time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI recommendation strip */}
      <div className="mx-3 mb-3 px-3 py-2.5 rounded-lg bg-[--primary]/6 border border-[--primary]/20">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={9} className="text-[--primary] shrink-0" />
          <span className="text-[8px] font-bold text-[--primary] uppercase tracking-wider">AI Recommendation</span>
        </div>
        <p className="text-[9px] text-[--foreground-muted] leading-relaxed">
          Deploy Gate 7 crowd stewards. Activate overflow routing via Sector B.
          Estimated 4 min to safe density threshold.
        </p>
      </div>

      {/* Shimmer overlay at bottom — fades into background to suggest more content */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-[--surface-1] to-transparent pointer-events-none" />
    </div>
  );
}

/**
 * HeroSection — editorial split layout.
 *
 * Left: headline, subtext, CTAs.
 * Right: faithful product UI preview using real design tokens and real data shapes.
 *
 * Background: slow radar sweep + grid pattern (pure CSS, reduced-motion safe).
 */
export function HeroSection() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      className="relative min-h-dvh flex items-center pt-15 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <AmbientBackground reduced={reduced} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">

          {/* Left — Headline + CTAs */}
          <div className="max-w-140">
            {/* Eyebrow */}
            <m.div
              initial={reduced ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[--primary]/25 bg-[--primary]/6 text-[10px] font-semibold text-[--primary] uppercase tracking-[0.15em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[--primary] animate-pulse" aria-hidden="true" />
                FIFA World Cup 2026 Stadium Operations
              </span>
            </m.div>

            {/* H1 */}
            <m.h1
              id="hero-heading"
              className="mt-5 text-[2.75rem] md:text-[3.5rem] font-bold leading-[1.08] tracking-tight text-[--foreground]"
              initial={reduced ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
            >
              Venue operations,{' '}
              <span className="text-[--primary]">intelligently commanded.</span>
            </m.h1>

            {/* Subtext */}
            <m.p
              className="mt-5 text-base md:text-[1.0625rem] text-[--foreground-muted] leading-relaxed max-w-115"
              initial={reduced ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.32, 0.72, 0, 1] }}
            >
              Real-time AI command center for stadium operators managing crowd flow,
              live incidents, and transport logistics during World Cup 2026 match days.
            </m.p>

            {/* CTAs */}
            <m.div
              className="mt-8 flex flex-wrap items-center gap-3"
              initial={reduced ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Primary CTA */}
              <Link
                href={ROUTES.dashboard}
                className={cn(
                  'group inline-flex items-center gap-2.5 px-5 py-3 rounded-lg',
                  'bg-[--primary] text-white text-sm font-semibold',
                  'hover:brightness-110 active:scale-[0.98]',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                  'shadow-[0_1px_3px_rgba(0,0,0,0.2),0_4px_16px_rgba(15,81,50,0.22)]'
                )}
              >
                Enter Command Center
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                  aria-hidden="true"
                />
              </Link>

              {/* Secondary CTA */}
              <a
                href="https://github.com/rahulasthwik1307/VenueMind-AI"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-3 rounded-lg',
                  'border border-black/10 text-[--foreground-muted] text-sm font-medium',
                  'hover:border-black/18 hover:text-[--foreground] hover:bg-black/3',
                  'transition-all duration-200 active:scale-[0.98]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary] focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                )}
                aria-label="View VenueMind AI on GitHub (opens in new tab)"
              >
                View Repository
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </m.div>

            {/* Small trust signal */}
            <m.p
              className="mt-6 text-[11px] text-[--foreground-subtle] flex items-center gap-1.5"
              initial={reduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.36 }}
            >
              <span className="w-1 h-1 rounded-full bg-[--primary]" aria-hidden="true" />
              Built with Next.js 15 · TypeScript · Groq (Llama 3.3 70B) · Framer Motion
            </m.p>
          </div>

          {/* Right — Product UI Preview */}
          <m.div
            className="lg:block w-full lg:w-auto"
            initial={reduced ? {} : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.32, 0.72, 0, 1] }}
          >
            <ProductPreview />
          </m.div>

        </div>
      </div>

      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-[--background] to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}
