'use client';

import { useRef } from 'react';
import { m, useInView, useReducedMotion } from 'framer-motion';
import {
  Globe2,
  ShieldAlert,
  Map,
  MessageSquare,
  Accessibility,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface FeatureTile {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  /** CSS grid span classes applied at the right breakpoint */
  span: string;
  accent: 'emerald' | 'blue' | 'red' | 'amber' | 'teal' | 'indigo';
}

const FEATURES: FeatureTile[] = [
  {
    id: 'digital-twin',
    icon: Globe2,
    title: 'Interactive Digital Twin',
    description:
      'Live sector-level stadium map with crowd density heat overlays and real-time gate status. Operators click any sector to drill into telemetry.',
    span: 'md:col-span-2',
    accent: 'emerald',
  },
  {
    id: 'ai-command',
    icon: ShieldAlert,
    title: 'AI Command Center',
    description:
      'Structured incident analysis and free-form operational queries powered by Groq Llama 3.3 70B. Sub-second AI response times.',
    span: 'md:col-span-1',
    accent: 'blue',
  },
  {
    id: 'incidents',
    icon: Map,
    title: 'Live Incident Management',
    description:
      'Full-function incident queue with AI-prioritised triage, bulk actions, severity filtering, and timeline history.',
    span: 'md:col-span-1',
    accent: 'red',
  },
  {
    id: 'multilingual',
    icon: MessageSquare,
    title: 'Multilingual AI Assistance',
    description:
      'AI responses delivered in English, Español, Français, Português, and हिंदी — switching language does not restart the session.',
    span: 'md:col-span-1',
    accent: 'amber',
  },
  {
    id: 'accessibility',
    icon: Accessibility,
    title: 'Accessibility Routing',
    description:
      'Dedicated routing and zone allocation tooling for mobility-impaired attendees, integrated with real-time crowd flow data.',
    span: 'md:col-span-1',
    accent: 'teal',
  },
  {
    id: 'intelligence',
    icon: BarChart3,
    title: 'Real-Time Operational Intelligence',
    description:
      'Match-phase-aware telemetry engine simulating ingress, 1st half, halftime, 2nd half, and egress cycles with live weather integration.',
    span: 'md:col-span-2',
    accent: 'indigo',
  },
];

const ACCENT_STYLES: Record<FeatureTile['accent'], { bg: string; icon: string; border: string }> = {
  emerald: {
    bg: 'bg-primary/6',
    icon: 'text-primary bg-primary/10',
    border: 'border-primary/20',
  },
  blue: {
    bg: 'bg-[#4682b4]/[0.06]',
    icon: 'text-[#4682b4] bg-[#4682b4]/10',
    border: 'border-[#4682b4]/20',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600 bg-red-100',
    border: 'border-red-200',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-700 bg-amber-100',
    border: 'border-amber-200',
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'text-teal-700 bg-teal-100',
    border: 'border-teal-200',
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-700 bg-indigo-100',
    border: 'border-indigo-200',
  },
};

function FeatureTileCard({ tile, index }: { tile: FeatureTile; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion() ?? false;
  const accent = ACCENT_STYLES[tile.accent];

  const animVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <m.div
      ref={ref}
      variants={animVariants}
      initial={reduced ? 'visible' : 'hidden'}
      animate={isInView ? 'visible' : 'hidden'}
      className={cn(tile.span, 'col-span-1')}
    >
      <div
        className={cn(
          'group relative h-full rounded-[--radius-card] border p-6',
          'bg-surface-1 transition-all duration-200 cursor-default',
          'hover:scale-[1.015] hover:shadow-(--shadow-lg)',
          accent.border
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4',
            accent.icon
          )}
          aria-hidden="true"
        >
          <tile.icon size={19} strokeWidth={1.75} />
        </div>

        {/* Content */}
        <h3 className="text-sm font-bold text-foreground leading-snug mb-2">
          {tile.title}
        </h3>
        <p className="text-[13px] text-muted leading-relaxed">
          {tile.description}
        </p>

        {/* Subtle accent corner */}
        <div
          className={cn(
            'absolute top-0 right-0 w-20 h-20 rounded-[--radius-card] opacity-40',
            'pointer-events-none',
            accent.bg
          )}
          aria-hidden="true"
          style={{ borderRadius: '0 12px 0 80px' }}
        />
      </div>
    </m.div>
  );
}

/**
 * BentoFeatureGrid — 6-tile asymmetric CSS Grid.
 *
 * - Large tiles (col-span-2) for Digital Twin and Operational Intelligence.
 * - Standard tiles (col-span-1) for the remaining four.
 * - Framer Motion `useInView` scroll-triggered fade-up with staggered delay.
 * - All animations suppressed under `prefers-reduced-motion`.
 * - Mobile: single-column stack, all span overrides reset to col-span-1.
 */
export function BentoFeatureGrid() {
  return (
    <section
      id="capabilities"
      className="w-full max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 scroll-mt-20"
      aria-labelledby="features-heading"
    >
      {/* Section header */}
      <div className="mb-12">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
          Capabilities
        </span>
        <h2
          id="features-heading"
          className="text-3xl md:text-[2.25rem] font-bold text-foreground leading-tight tracking-tight"
        >
          Built for match-day operations.
        </h2>
        <p className="mt-3 text-sm text-muted max-w-110 leading-relaxed">
          Every feature is scoped to the specific demands of stadium operators during a live World Cup event — not generic event management.
        </p>
      </div>

      {/* Asymmetric bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((tile, index) => (
          <FeatureTileCard key={tile.id} tile={tile} index={index} />
        ))}
      </div>
    </section>
  );
}
