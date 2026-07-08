'use client';

import { Brain, Sparkles, Wifi } from 'lucide-react';
import { m } from 'framer-motion';

export function CommandCenterHeader() {
  return (
    <m.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start justify-between gap-4 flex-wrap"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md bg-(--primary) flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Brain size={14} strokeWidth={1.75} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-(--foreground) leading-tight tracking-tight">
            AI Command Center
          </h1>
        </div>
        <p className="text-xs text-(--foreground-muted) ml-9 leading-snug max-w-md">
          Operational intelligence &amp; AI-assisted decision support — FIFA World Cup 2026
        </p>
      </div>

      {/* AI model + status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-(--surface-2) border border-(--border)">
          <Wifi size={10} className="text-(--primary) live-indicator" aria-hidden="true" />
          <span className="text-[9px] font-bold font-mono text-(--primary) uppercase tracking-wide">
            Live
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-(--primary-muted) border border-(--primary-light)">
          <Sparkles size={10} className="text-(--primary)" aria-hidden="true" />
          <span className="text-[9px] font-bold font-mono text-(--primary) uppercase tracking-wide">
            Llama 3.3 · 70B
          </span>
        </div>
        <span className="text-[9px] font-mono text-(--foreground-subtle) bg-(--surface-2) border border-(--border) px-2 py-1 rounded-md">
          POWERED BY GROQ
        </span>
      </div>
    </m.div>
  );
}
