'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface NoteItem {
  id: string;
  timestamp: string;
  content: string;
}

interface SharedNotesProps {
  draft: string;
  notes: NoteItem[];
  onChangeDraft: (val: string) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  placeholder?: string;
  historyTitle: string;
  ariaLabel: string;
  maxHeightClass?: string;
}

export function SharedNotes({
  draft,
  notes,
  onChangeDraft,
  onSave,
  onDelete,
  placeholder = 'Type a log entry...',
  historyTitle,
  ariaLabel,
  maxHeightClass = 'max-h-36',
}: SharedNotesProps) {
  const [collapsed, setCollapsed] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (draft.trim()) {
        onSave();
      }
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={draft}
        onChange={(e) => onChangeDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full min-h-14 p-2 text-xs text-(--foreground) placeholder:text-(--foreground-subtle)',
          'bg-(--surface-2) border border-(--border) rounded-sm resize-none',
          'focus:outline-none focus:ring-1 focus:ring-(--primary) focus:border-(--primary)',
          'transition-all'
        )}
        aria-label={ariaLabel}
      />

      <div className="flex justify-between items-center">
        <span className="text-[9px] text-(--foreground-subtle)">
          Press Ctrl+Enter to save
        </span>
        <button
          onClick={onSave}
          disabled={!draft.trim()}
          className={cn(
            'px-2 py-0.5 text-[9px] font-bold rounded-sm border transition-all duration-150 uppercase tracking-wide cursor-pointer',
            draft.trim()
              ? 'bg-(--primary) text-white border-(--primary) hover:bg-(--primary-hover)'
              : 'bg-(--surface-2) border-(--border) text-(--foreground-subtle) cursor-not-allowed'
          )}
        >
          Save
        </button>
      </div>

      {/* History Log */}
      {notes.length > 0 && (
        <div className="mt-2 pt-2 border-t border-(--border) space-y-1.5">
          <span className="text-[9px] font-bold text-(--foreground-subtle) uppercase tracking-wider block">
            {historyTitle}
          </span>

          {/* Most recent note */}
          <div className="relative bg-(--surface-2)/40 border border-(--border)/60 rounded-sm p-1.5 text-[10px] leading-snug space-y-0.5 animate-fade-in group">
            <div className="flex justify-between items-center text-[8px] font-mono text-(--foreground-subtle) pr-4">
              <span className="font-semibold">Rahul Asthwik</span>
              <span>{notes[0].timestamp}</span>
            </div>
            <p className="text-(--foreground-muted) whitespace-pre-wrap break-words">
              {notes[0].content}
            </p>
            <button
              onClick={() => onDelete(notes[0].id)}
              className={cn(
                'absolute top-1 right-1 text-(--foreground-subtle) hover:text-red-500 p-0.5 rounded cursor-pointer transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500'
              )}
              aria-label="Delete note"
            >
              <X size={10} />
            </button>
          </div>

          {/* Toggle for older history */}
          {notes.length > 1 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle) hover:text-(--foreground) transition-colors mt-2 cursor-pointer"
              aria-expanded={!collapsed}
            >
              <span>{collapsed ? 'Show more history' : 'Hide history'}</span>
              {collapsed ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
            </button>
          )}

          {/* Scrollable list of older notes */}
          {!collapsed && notes.length > 1 && (
            <ul
              className={cn(
                'space-y-1.5 overflow-y-auto pr-0.5 mt-2 custom-scrollbar-always animate-fade-in',
                maxHeightClass
              )}
              aria-label={`Older ${historyTitle.toLowerCase()} entries`}
              aria-live="polite"
            >
              {notes.slice(1).map((note) => (
                <li
                  key={note.id}
                  className="relative bg-(--surface-2)/30 border border-(--border)/40 rounded-sm p-1.5 text-[10px] leading-snug space-y-0.5"
                >
                  <div className="flex justify-between items-center text-[8px] font-mono text-(--foreground-subtle) pr-4">
                    <span className="font-semibold">Rahul Asthwik</span>
                    <span>{note.timestamp}</span>
                  </div>
                  <p className="text-(--foreground-muted) whitespace-pre-wrap break-words">
                    {note.content}
                  </p>
                  <button
                    onClick={() => onDelete(note.id)}
                    className={cn(
                      'absolute top-1 right-1 text-(--foreground-subtle) hover:text-red-500 p-0.5 rounded cursor-pointer transition-colors',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500'
                    )}
                    aria-label="Delete note"
                  >
                    <X size={10} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
