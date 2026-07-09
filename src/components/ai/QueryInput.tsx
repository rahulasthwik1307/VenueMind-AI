'use client';

/**
 * QueryInput — Free-form and Supplemental Query Input
 *
 * Accessibility:
 * - Explicit <label> linked via htmlFor
 * - Enter key submits the query (Shift+Enter for new line)
 * - aria-disabled on submit button while isAnalyzing (prevents duplicate submissions)
 * - Focus ring visible on textarea and button
 * - aria-label on submit button
 */

import { KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isAnalyzing: boolean;
  placeholder?: string;
  label?: string;
  /** Input ID for label association */
  inputId?: string;
  /** Custom submit enabling logic override */
  canSubmit?: boolean;
  /** Custom visible rows count */
  rows?: number;
}

const MAX_VISIBLE_LENGTH = 500;

export function QueryInput({
  value,
  onChange,
  onSubmit,
  isAnalyzing,
  placeholder = 'Ask a question about stadium operations…',
  label = 'Operational Query',
  inputId = 'ai-query-input',
  canSubmit: canSubmitProp,
  rows = 3,
}: QueryInputProps) {
  const charCount = value.length;
  const isOverLimit = charCount > MAX_VISIBLE_LENGTH;
  const canSubmit = (canSubmitProp !== undefined ? canSubmitProp : value.trim().length > 0) && !isAnalyzing && !isOverLimit;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter (without Shift) submits; Shift+Enter inserts newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) onSubmit();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-[10px] font-bold uppercase tracking-wide text-(--foreground-subtle) font-mono"
        >
          {label}
        </label>
        <span
          className={cn(
            'text-[9px] font-mono tabular-nums',
            isOverLimit ? 'text-red-500' : 'text-(--foreground-subtle)'
          )}
          aria-live="polite"
          aria-label={`${charCount} of ${MAX_VISIBLE_LENGTH} characters used`}
        >
          {charCount}/{MAX_VISIBLE_LENGTH}
        </span>
      </div>

      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={isAnalyzing}
        aria-label={label}
        aria-describedby={`${inputId}-hint`}
        className={cn(
          'w-full resize-none text-sm px-3 py-2.5 rounded-md overflow-y-auto',
          'bg-(--surface-1) border border-(--border)',
          'text-(--foreground) placeholder:text-(--foreground-subtle)',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)',
          'transition-colors duration-150',
          isAnalyzing && 'opacity-60 cursor-not-allowed',
          isOverLimit && 'border-red-500/50 focus-visible:ring-red-500'
        )}
      />
      <p
        id={`${inputId}-hint`}
        className="text-[9px] text-(--foreground-subtle)"
        aria-live="off"
      >
        Press Enter to submit · Shift+Enter for new line
      </p>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
        aria-label={isAnalyzing ? 'AI is analyzing, please wait' : 'Submit query to AI'}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md',
          'text-sm font-semibold transition-all duration-150',
          canSubmit
            ? 'bg-(--primary) text-white hover:bg-(--primary-hover) active:scale-[0.98] cursor-pointer'
            : 'bg-(--surface-3) text-(--foreground-subtle) cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-1'
        )}
      >
        <Send size={14} aria-hidden="true" />
        {isAnalyzing ? 'Analyzing…' : 'Analyze'}
      </button>
    </div>
  );
}
