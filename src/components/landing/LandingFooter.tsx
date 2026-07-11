import { Cpu } from 'lucide-react';

/** Minimal SVG GitHub mark */
function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/** Minimal SVG LinkedIn mark */
function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const CURRENT_YEAR = new Date().getFullYear();

/**
 * LandingFooter — Server Component.
 *
 * Two-column layout: brand on the left, creator info + real social links on the right.
 * Collapses to a single column on mobile (brand on top, creator info below).
 * All links are real <a> elements — no placeholder buttons.
 */
export function LandingFooter() {
  return (
    <footer
      className="w-full border-t border-border bg-surface-1"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12">

          {/* Left: Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Cpu size={14} strokeWidth={1.75} className="text-white" />
              </div>
              <span className="text-sm font-bold text-foreground tracking-tight">
                VenueMind <span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-subtle leading-relaxed max-w-65">
              AI-powered stadium operations platform for FIFA World Cup 2026.
              Real-time command center for venue management staff.
            </p>
            <p className="text-[10px] text-subtle font-mono">
              Next.js · TypeScript · Groq AI · Framer Motion
            </p>
          </div>

          {/* Right: Creator + social links */}
          <div className="flex flex-col gap-3 md:items-end">
            <p className="text-[11px] text-muted">
              Designed &amp; developed by{' '}
              <span className="font-semibold text-foreground">Rahul Asthwik</span>
              <span className="text-subtle mx-1.5">·</span>
              <span className="text-subtle">{CURRENT_YEAR}</span>
            </p>

            <div className="flex items-center gap-2" role="list" aria-label="Social links">
              <a
                href="https://github.com/rahulasthwik1307"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Rahul Asthwik on GitHub (opens in new tab)"
                role="listitem"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-muted hover:text-foreground hover:border-border-strong hover:bg-surface-2 transition-all duration-150 text-[11px] font-medium min-h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <GitHubIcon />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/rahul-asthwik-sunki/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Rahul Asthwik on LinkedIn (opens in new tab)"
                role="listitem"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-muted hover:text-foreground hover:border-border-strong hover:bg-surface-2 transition-all duration-150 text-[11px] font-medium min-h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <LinkedInIcon />
                LinkedIn
              </a>
              <a
                href="https://github.com/rahulasthwik1307/VenueMind-AI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="VenueMind AI repository on GitHub (opens in new tab)"
                role="listitem"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-muted hover:text-foreground hover:border-border-strong hover:bg-surface-2 transition-all duration-150 text-[11px] font-medium min-h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Repository
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
