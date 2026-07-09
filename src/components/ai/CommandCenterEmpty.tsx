'use client';

/**
 * CommandCenterEmpty — Idle State Dashboard
 *
 * Rendered when no query has been submitted yet in the session.
 * Features:
 * - Interactive mode selector cards (reduced padding, distinct emerald vs slate accents)
 * - Clickable example query suggestion buttons (real button elements with focus states)
 * - Semantic AI capability list (using HTML ul/li with distinct muted accents for visual interest)
 * - Recent session command actions strip (dispatched AI recommendations)
 *
 * Accessibility:
 * - Proper focus ring highlights
 * - Real focusable buttons for suggestions
 * - Semantic lists (ul/li) for capability and activities
 */

import { Brain, AlertCircle, MapPin, LayoutGrid, Layers, Send, HelpCircle } from 'lucide-react';
import type { ActivityItem } from '@/types/incident';
import { cn } from '@/utils/cn';

interface CommandCenterEmptyProps {
  onSelectExample: (
    query: string,
    mode: 'freeform' | 'structured',
    structuredTab?: 'incident' | 'zone' | 'domain',
    selectionValue?: string
  ) => void;
  onSelectMode: (mode: 'freeform' | 'structured') => void;
  recentActivities: ActivityItem[];
}

export function CommandCenterEmpty({
  onSelectExample,
  onSelectMode,
  recentActivities,
}: CommandCenterEmptyProps) {
  return (
    <div
      className="flex flex-col items-center justify-start py-2 px-4 text-center gap-5 w-full min-w-0"
      role="region"
      aria-label="AI Command Center — Idle dashboard"
    >
      {/* Icon & Welcome */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-11 h-11 rounded-lg bg-(--primary-muted) border border-(--primary-light) flex items-center justify-center shadow-xs">
          <Brain size={20} strokeWidth={1.5} className="text-(--primary)" aria-hidden="true" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-xs font-bold text-(--foreground)">Ready for your query</h2>
          <p className="text-[10px] text-(--foreground-muted) leading-relaxed">
            Select an incident, zone, or operational domain for a structured briefing — or type a direct
            question in free-form mode. The AI will return a structured analysis in seconds.
          </p>
        </div>
      </div>

      {/* Mode Cards (Interactive Buttons — Reduced Size & Muted Accent Tints) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg text-left">
        {[
          {
            value: 'structured' as const,
            label: 'Structured mode',
            hint: 'Pick an active incident or domain — AI generates a full briefing.',
            icon: <Layers size={11} className="text-emerald-600 dark:text-emerald-400" />,
            colorClass: 'bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-500/10 dark:hover:bg-emerald-950/20 hover:border-emerald-200 dark:hover:border-emerald-900/50',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200/50 dark:border-emerald-900/50',
          },
          {
            value: 'freeform' as const,
            label: 'Free-form mode',
            hint: 'Type any operational question, e.g. "What is crowd risk at Gate D?"',
            icon: <HelpCircle size={11} className="text-slate-600 dark:text-slate-400" />,
            colorClass: 'bg-slate-500/5 dark:bg-slate-950/10 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-500/10 dark:hover:bg-slate-950/20 hover:border-slate-300 dark:hover:border-slate-700',
            iconBg: 'bg-slate-100 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50',
          },
        ].map(({ value, label, hint, icon, colorClass, iconBg }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelectMode(value)}
            className={cn(
              "flex gap-2 p-2 rounded-md border cursor-pointer text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary) transition-all duration-150 shadow-xs",
              colorClass
            )}
            aria-label={`Switch left panel context to ${label}`}
          >
            <div className={cn("w-7 h-7 rounded border shrink-0 flex items-center justify-center shadow-xs", iconBg)}>
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-(--foreground)">{label}</p>
              <p className="text-[8.5px] text-(--foreground-muted) leading-snug mt-0.5 truncate">{hint}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Suggestions Chips */}
      <div className="w-full max-w-lg border-t border-(--border) pt-4">
        <h3 className="text-[9.5px] font-bold font-mono text-(--foreground-subtle) uppercase tracking-wider text-center mb-2.5">
          Suggested Queries
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            {
              text: "What is the crowd risk at Gate D right now?",
              label: "What's the crowd risk at Gate D?",
              mode: 'structured' as const,
              tab: 'zone' as const,
              value: 'Gate D',
            },
            {
              text: "Summarize all open critical incidents across the stadium.",
              label: "Summarize critical incidents",
              mode: 'freeform' as const,
            },
            {
              text: "Prioritize the current incident queue based on severity and operational impact.",
              label: "Prioritize current queue",
              mode: 'freeform' as const,
            },
          ].map((suggest) => (
            <button
              key={suggest.text}
              type="button"
              onClick={() =>
                onSelectExample(
                  suggest.text,
                  suggest.mode,
                  'tab' in suggest ? suggest.tab : undefined,
                  'value' in suggest ? suggest.value : undefined
                )
              }
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-(--surface-2) border border-(--border) hover:bg-(--surface-3) hover:border-(--border-strong) cursor-pointer text-[9.5px] font-medium text-(--foreground-muted) hover:text-(--foreground) focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary) transition-all duration-150 shadow-xs"
              aria-label={`Prefill suggestions: ${suggest.text}`}
            >
              <Send size={8} className="text-(--primary)" aria-hidden="true" />
              {suggest.label}
            </button>
          ))}
        </div>
      </div>

      {/* Capability List (Subtly color tinted capability cards) */}
      <div className="w-full max-w-lg border-t border-(--border) pt-4">
        <h3 className="text-[9.5px] font-bold font-mono text-(--foreground-subtle) uppercase tracking-wider text-center mb-2.5">
          AI Capabilities
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-md mx-auto" role="list">
          {[
            {
              title: 'Incident Analysis',
              desc: 'Deep-dive risk analysis and tactical recommendations.',
              icon: <AlertCircle size={12} aria-hidden="true" />,
              colorClass: 'bg-rose-500/5 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400',
              iconBg: 'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-900/40',
            },
            {
              title: 'Zone Briefings',
              desc: 'Real-time telemetry and situational awareness summaries.',
              icon: <MapPin size={12} aria-hidden="true" />,
              colorClass: 'bg-blue-500/5 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400',
              iconBg: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-900/40',
            },
            {
              title: 'Domain Intelligence',
              desc: 'Cross-stadium logistics, crowd, and transport risk modeling.',
              icon: <LayoutGrid size={12} aria-hidden="true" />,
              colorClass: 'bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400',
              iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-900/40',
            },
            {
              title: 'Multi-Incident Prioritization',
              desc: 'Consolidated briefing and prioritization of active queues.',
              icon: <Layers size={12} aria-hidden="true" />,
              colorClass: 'bg-amber-500/5 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400',
              iconBg: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-900/40',
            },
          ].map(({ title, desc, icon, colorClass, iconBg }) => (
            <li key={title} className={cn("flex gap-2 items-start p-2 rounded-md border shadow-xs min-w-0", colorClass)}>
              <div className={cn("w-7 h-7 rounded border shrink-0 flex items-center justify-center shadow-xs", iconBg)}>
                {icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-[9.5px] font-bold">{title}</h4>
                <p className="text-[8.5px] text-(--foreground-muted) leading-snug mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Dispatches strip */}
      <div className="w-full max-w-lg border-t border-(--border) pt-4">
        <h3 className="text-[9.5px] font-bold font-mono text-(--foreground-subtle) uppercase tracking-wider text-center mb-2.5">
          Recent Command Actions
        </h3>
        {recentActivities.length === 0 ? (
          <p className="text-[9px] text-(--foreground-subtle) italic text-center leading-relaxed">
            No actions dispatched this session. Recommended responses sent to the Ops Timeline will appear here.
          </p>
        ) : (
          <ul className="space-y-1.5 max-w-md mx-auto w-full min-w-0" role="list">
            {recentActivities.map((act) => (
              <li
                key={act.id}
                className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded bg-(--surface-2) border border-(--border) shadow-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                  <span className="text-[9px] text-(--foreground-muted) truncate font-mono">
                    {act.message.replace('AI Dispatch: ', '')}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-(--foreground-subtle) shrink-0">
                  {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
