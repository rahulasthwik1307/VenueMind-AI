'use client';

import { Brain, Sparkles } from 'lucide-react';
import { m } from 'framer-motion';

export function CommandCenterHeader() {
  return (
    <m.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start justify-between gap-4 flex-wrap"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg bg-(--primary-muted) border border-(--primary-light) shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),_0_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Brain size={18} strokeWidth={1.75} className="text-(--primary)" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-(--foreground) leading-none tracking-tight">
            AI Command Center
          </h1>
          <p className="text-xs text-(--foreground-muted) leading-snug max-w-md mt-1">
            Operational intelligence &amp; AI-assisted decision support — FIFA World Cup 2026
          </p>
        </div>
      </div>

      {/* AI model + status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-(--surface-2) border border-(--border) shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse shrink-0" />
          <span className="text-[9px] font-bold font-mono text-(--foreground) uppercase tracking-wider">
            LIVE TELEMETRY
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-(--primary-muted) border border-(--primary-light) shadow-xs">
          <Sparkles size={10} className="text-(--primary)" aria-hidden="true" />
          <span className="text-[9px] font-bold font-mono text-(--primary) uppercase tracking-wider">
            Llama 3.3 · 70B
          </span>
        </div>
        <span className="text-[9px] font-bold font-mono text-(--foreground-muted) bg-(--surface-2) border border-(--border) px-2.5 py-1 rounded-md tracking-widest shadow-xs">
          GROQ ACCELERATED
        </span>
      </div>
    </m.div>
  );
}
