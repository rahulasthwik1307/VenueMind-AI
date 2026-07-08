'use client';

/**
 * ExpandableAICard — Shared AI Output Card
 *
 * Extracted from AIContextPanel into a reusable component used by both:
 * - Digital Twin: AIContextPanel.tsx (incident/zone analysis)
 * - Command Center: AIResponseCard.tsx (Command Center page)
 *
 * Displays a collapsible card with a headline preview and full prose on expand.
 * All four themes (neutral, warning, info, success) match the existing design language.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AICardTheme = 'neutral' | 'warning' | 'info' | 'success';

export interface ExpandableAICardProps {
  title: string;
  icon: React.ReactNode;
  prose: string;
  theme: AICardTheme;
  /** Optional: start in expanded state */
  defaultExpanded?: boolean;
}

const THEME_STYLES: Record<
  AICardTheme,
  { bg: string; titleText: string; iconText: string; proseText: string }
> = {
  neutral: {
    bg: 'bg-(--surface-2) border-(--border)',
    titleText: 'text-(--foreground) font-mono',
    iconText: 'text-(--primary)',
    proseText: 'text-(--foreground-muted)',
  },
  warning: {
    bg: 'bg-amber-950/20 border-amber-900/50',
    titleText: 'text-amber-300 font-mono',
    iconText: 'text-amber-500',
    proseText: 'text-amber-200',
  },
  info: {
    bg: 'bg-blue-950/20 border-blue-900/50',
    titleText: 'text-blue-300 font-mono',
    iconText: 'text-blue-400',
    proseText: 'text-blue-200',
  },
  success: {
    bg: 'bg-emerald-950/20 border-emerald-900/50',
    titleText: 'text-emerald-300 font-mono',
    iconText: 'text-emerald-400',
    proseText: 'text-emerald-200',
  },
};

export function ExpandableAICard({
  title,
  icon,
  prose,
  theme,
  defaultExpanded = false,
}: ExpandableAICardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Derive a short headline from the first sentence of prose (max 8 words)
  const sentences = prose.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  let headline = sentences[0] ?? 'Operational review active.';
  const headlineWords = headline.split(/\s+/);
  if (headlineWords.length > 8) {
    headline = headlineWords.slice(0, 7).join(' ') + '…';
  } else if (!headline.endsWith('.')) {
    headline = headline + '.';
  }
  const supporting = sentences[1] ? sentences[1] + '.' : 'Telemetry parameters verified.';

  const style = THEME_STYLES[theme];
  const toggleId = `expandable-ai-card-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={cn('border rounded-md p-2.5 transition-all shadow-sm', style.bg)}>
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        id={toggleId}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={style.iconText} aria-hidden="true">
            {icon}
          </span>
          <span className={cn('text-[9px] font-bold uppercase tracking-wide truncate', style.titleText)}>
            {title}
          </span>
        </div>
        <div className="text-(--foreground-subtle) hover:text-(--foreground) shrink-0 p-0.5 ml-1" aria-hidden="true">
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </div>
      </div>

      {!isExpanded ? (
        <div className="mt-1.5 space-y-0.5" aria-live="off">
          <p className="text-[10.5px] font-bold text-(--foreground) leading-snug">{headline}</p>
          <p className="text-[9px] text-(--foreground-subtle) leading-normal truncate">
            {supporting}
          </p>
        </div>
      ) : (
        <p
          className={cn('text-[10px] leading-relaxed mt-2 animate-fade-in', style.proseText)}
          aria-live="polite"
        >
          {prose}
        </p>
      )}
    </div>
  );
}
