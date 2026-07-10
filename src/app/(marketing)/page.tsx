import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { TechStackStrip } from '@/components/landing/TechStackStrip';
import { BentoFeatureGrid } from '@/components/landing/BentoFeatureGrid';
import { PersonaFocusSection } from '@/components/landing/PersonaFocusSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'VenueMind AI — FIFA World Cup 2026 Stadium Operations',
  description:
    'Real-time AI-powered command center for stadium operators managing crowd flow, live incidents, and transport logistics during World Cup 2026 match days.',
  openGraph: {
    title: 'VenueMind AI — Stadium Operations Command Center',
    description:
      'AI-powered real-time operations platform for FIFA World Cup 2026 venue management staff.',
    type: 'website',
  },
};

/**
 * Landing page — root route "/".
 *
 * Lives in the (marketing) route group, which does NOT inherit the (app) layout.
 * This means no AppShell, no sidebar, no header, no right panel, and — critically —
 * no DashboardSimulator mounting. The simulation engine never ticks on this route.
 *
 * Page structure:
 *   LandingHeader    — sticky, transparent → solid on scroll
 *   HeroSection      — editorial split: headline + CTAs + product UI preview
 *   TechStackStrip   — horizontal badge row
 *   BentoFeatureGrid — 6-tile asymmetric grid with scroll-triggered animations
 *   PersonaFocusSection — editorial prose about the venue operator persona decision
 *   LandingFooter    — creator info + real social links
 */
export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-[--background]">
      {/* Skip to main content for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-[--primary] focus:text-white focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <LandingHeader />

      <main id="main-content" className="flex-1 flex flex-col">
        <HeroSection />
        <TechStackStrip />
        <BentoFeatureGrid />
        <PersonaFocusSection />
      </main>

      <LandingFooter />
    </div>
  );
}
