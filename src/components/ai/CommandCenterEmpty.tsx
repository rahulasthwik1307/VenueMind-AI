'use client';

import { Brain, Sparkles } from 'lucide-react';

export function CommandCenterEmpty() {
  return (
    <div
      className="flex flex-col items-center justify-center py-14 px-6 text-center gap-5"
      role="region"
      aria-label="AI Command Center — no query submitted yet"
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-(--primary-muted) border border-(--primary-light) flex items-center justify-center">
        <Brain size={22} strokeWidth={1.5} className="text-(--primary)" aria-hidden="true" />
      </div>

      {/* Copy */}
      <div className="space-y-2 max-w-xs">
        <h2 className="text-sm font-bold text-(--foreground)">Ready for your query</h2>
        <p className="text-xs text-(--foreground-muted) leading-relaxed">
          Select an incident, zone, or operational domain for a structured briefing — or type a direct
          question in free-form mode. The AI will return a structured analysis in seconds.
        </p>
      </div>

      {/* Mode hints */}
      <div className="grid grid-cols-1 gap-2 w-full max-w-xs text-left">
        {[
          {
            label: 'Structured mode',
            hint: 'Pick an active incident or domain — AI generates a full operational briefing.',
          },
          {
            label: 'Free-form mode',
            hint: 'Type any operational question, e.g. "What is the crowd risk at Gate D right now?"',
          },
        ].map(({ label, hint }) => (
          <div
            key={label}
            className="flex gap-2.5 p-2.5 rounded-md bg-(--surface-2) border border-(--border)"
          >
            <Sparkles size={12} className="text-(--primary) shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-bold text-(--foreground)">{label}</p>
              <p className="text-[9px] text-(--foreground-muted) leading-snug mt-0.5">{hint}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
