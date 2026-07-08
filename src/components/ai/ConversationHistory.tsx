'use client';

import { m, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Brain, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import type { Message } from '@/types/assistant';

interface ConversationHistoryProps {
  messages: Message[];
  className?: string;
}

export function ConversationHistory({ messages, className }: ConversationHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show paired exchanges (user + assistant alternating)
  const pairs: { user: Message; assistant: Message | null }[] = [];
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === 'user') {
      pairs.push({
        user: messages[i],
        assistant: messages[i + 1]?.role === 'assistant' ? messages[i + 1] : null,
      });
      if (messages[i + 1]?.role === 'assistant') i++;
    }
  }

  if (pairs.length === 0) return null;

  // Show only last 3 pairs when collapsed
  const visiblePairs = isExpanded ? pairs : pairs.slice(-3);
  const hasMore = pairs.length > 3;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MessageSquare size={11} className="text-(--foreground-subtle)" aria-hidden="true" />
          <span className="text-[9px] font-bold font-mono text-(--foreground-subtle) uppercase tracking-wide">
            Session History ({pairs.length})
          </span>
        </div>
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[9px] font-semibold text-(--primary) hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary) rounded"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Show fewer history items' : 'Show all history items'}
          >
            {isExpanded ? 'Show less' : `Show all ${pairs.length}`}
          </button>
        )}
      </div>

      <div className="relative">
        <div className="max-h-[220px] md:max-h-[260px] overflow-y-auto pr-1.5 space-y-2 pb-6 custom-scrollbar-always">
          <AnimatePresence initial={false}>
            {visiblePairs.map(({ user, assistant }, idx) => (
              <m.div
                key={user.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="rounded-md border border-(--border) bg-(--surface-1) overflow-hidden"
              >
                {/* User query */}
                <div className="flex items-start gap-2 px-2.5 py-2 bg-(--surface-2)">
                  <User size={10} className="text-(--foreground-subtle) mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-[10px] text-(--foreground-muted) leading-snug line-clamp-2">
                    {user.content}
                  </p>
                </div>

                {/* AI response summary */}
                {assistant && (
                  <div className="flex items-start gap-2 px-2.5 py-2">
                    <Brain size={10} className="text-(--primary) mt-0.5 shrink-0" aria-hidden="true" />
                    <p className="text-[10px] text-(--foreground-muted) leading-snug line-clamp-2">
                      {assistant.content}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <div className="px-2.5 pb-1.5 flex justify-end">
                  <span className="text-[8px] font-mono text-(--foreground-subtle)">
                    {new Date(user.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
        {/* Bottom fade gradient to signal more content to scroll */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-(--surface-1) to-transparent pointer-events-none z-10" />
      </div>

      {hasMore && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-center gap-1 py-1.5 text-[9px] font-mono text-(--foreground-subtle) hover:text-(--foreground) border border-dashed border-(--border) rounded-md transition-colors"
          aria-label={`Show ${pairs.length - 3} more history items`}
        >
          <ChevronDown size={10} aria-hidden="true" />
          {pairs.length - 3} more
        </button>
      )}
    </div>
  );
}
