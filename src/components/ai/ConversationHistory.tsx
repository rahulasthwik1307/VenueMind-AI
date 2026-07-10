'use client';

import { m, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Brain } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Message } from '@/types/assistant';

interface ConversationHistoryProps {
  messages: Message[];
  className?: string;
}

export function ConversationHistory({ messages, className }: ConversationHistoryProps) {
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

  return (
    <div className={cn('flex flex-col gap-2 min-h-0', className)}>
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <MessageSquare size={11} className="text-(--foreground-subtle)" aria-hidden="true" />
          <span className="text-[9px] font-bold font-mono text-(--foreground-subtle) uppercase tracking-wide">
            Session History ({pairs.length})
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1.5 space-y-2 pb-3 custom-scrollbar-always min-h-0">
        <AnimatePresence initial={false}>
          {pairs.map(({ user, assistant }, idx) => (
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
    </div>
  );
}
