import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { RefObject } from 'react';

interface CommandSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  onChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClose: () => void;
  hasResults: boolean;
  activeId?: string;
}

export function CommandSearch({
  inputRef,
  query,
  onChange,
  onKeyDown,
  onClose,
  hasResults,
  activeId,
}: CommandSearchProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-(--border)">
      <Search
        size={15}
        className="shrink-0 text-(--foreground-subtle)"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={hasResults}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-controls="cmd-palette-results"
        placeholder="Search sections or incidents…"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className={cn(
          'flex-1 text-sm text-(--foreground) placeholder:text-(--foreground-subtle)',
          'bg-transparent outline-none border-none',
        )}
        autoComplete="off"
        spellCheck={false}
      />
      <button
        onClick={onClose}
        className={cn(
          'shrink-0 flex items-center justify-center w-6 h-6 rounded',
          'text-(--foreground-subtle) hover:bg-(--surface-2) hover:text-(--foreground)',
          'transition-colors duration-150',
        )}
        aria-label="Close command palette"
        tabIndex={-1}
      >
        <X size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
