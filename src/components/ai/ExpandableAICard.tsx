'use client';

/**
 * ExpandableAICard — Shared AI Output Card
 *
 * Extracted from AIContextPanel into a reusable component used by both:
 * - Digital Twin: AIContextPanel.tsx (incident/zone analysis)
 * - Command Center: AIResponseCard.tsx (Command Center page)
 *
 * Displays a collapsible card with a headline preview and full prose on expand.
 * Theme styles support clean light and dark modes.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { m, AnimatePresence } from 'framer-motion';

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
    bg: 'bg-linear-to-b from-(--surface-1) to-(--surface-2)/30 dark:from-(--surface-1) dark:to-(--surface-2)/20 border-(--border)',
    titleText: 'text-(--foreground) font-mono',
    iconText: 'text-(--primary)',
    proseText: 'text-(--foreground-muted)',
  },
  warning: {
    bg: 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 dark:border-amber-500/30',
    titleText: 'text-amber-700 dark:text-amber-300 font-mono',
    iconText: 'text-amber-600 dark:text-amber-500',
    proseText: 'text-amber-800/80 dark:text-amber-200/90',
  },
  info: {
    bg: 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20 dark:border-blue-500/30',
    titleText: 'text-blue-700 dark:text-blue-300 font-mono',
    iconText: 'text-blue-600 dark:text-blue-400',
    proseText: 'text-blue-800/80 dark:text-blue-200/90',
  },
  success: {
    bg: 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30',
    titleText: 'text-emerald-700 dark:text-emerald-300 font-mono',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    proseText: 'text-emerald-800/80 dark:text-emerald-200/90',
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
    <div className={cn('border rounded-md p-3 transition-all duration-200 shadow-xs hover:shadow-sm', style.bg)}>
      <div
        className="flex items-center justify-between cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary) rounded"
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
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn('flex items-center justify-center shrink-0', style.iconText)} aria-hidden="true">
            {icon}
          </span>
          <span className={cn('text-[9px] font-bold uppercase tracking-wide truncate', style.titleText)}>
            {title}
          </span>
        </div>
        <div className="text-(--foreground-subtle) hover:text-(--foreground) shrink-0 p-0.5 ml-1 transition-colors duration-150" aria-hidden="true">
          {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {!isExpanded ? (
          <m.div
            key="collapsed"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden mt-1.5 space-y-0.5"
            aria-live="off"
          >
            <p className="text-[10.5px] font-bold text-(--foreground) leading-snug">{headline}</p>
            <p className="text-[9px] text-(--foreground-subtle) leading-normal truncate">
              {supporting}
            </p>
          </m.div>
        ) : (
          <m.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
            aria-live="polite"
          >
            <p className={cn('text-[10px] leading-relaxed mt-2', style.proseText)}>
              {prose}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

