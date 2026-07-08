'use client';

/**
 * AnalyzingState — Loading indicator for AI analysis in progress
 *
 * Motion duration respects the 150–350ms range per DESIGN.md and ENGINEERING.md.
 * Reduced motion via prefers-reduced-motion in global CSS (transitions disabled).
 */

import { m } from 'framer-motion';
import { Brain } from 'lucide-react';

export function AnalyzingState() {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center py-16 gap-5"
      role="status"
      aria-label="AI is analyzing the request"
      aria-live="polite"
    >
      {/* Pulsing brain icon */}
      <div className="relative flex items-center justify-center w-14 h-14">
        {/* Outer ring pulse */}
        <m.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-(--primary-muted) border border-(--primary-light)"
          aria-hidden="true"
        />
        {/* Spinner ring */}
        <m.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-1 rounded-full border-2 border-(--border) border-t-(--primary)"
          aria-hidden="true"
        />
        {/* Icon center */}
        <Brain size={18} strokeWidth={1.5} className="text-(--primary) relative z-10" aria-hidden="true" />
      </div>

      {/* Label + sub-label */}
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold text-(--foreground)">Analyzing</p>
        <m.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="text-xs text-(--foreground-subtle) font-mono"
          aria-hidden="true"
        >
          Processing operational context…
        </m.p>
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-1" aria-hidden="true">
        {[0, 0.18, 0.36].map((delay, i) => (
          <m.span
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
            transition={{ duration: 0.9, delay, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-1 rounded-full bg-(--primary)"
          />
        ))}
      </div>
    </m.div>
  );
}
