import { useState, useRef } from 'react';
import { Languages } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/store/modules/ui';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import type { AssistantLanguage } from '@/types/assistant';

export function LanguageSelector() {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  useOutsideClick(langRef, () => setIsLangOpen(false), isLangOpen);


  return (
    <div className="relative" ref={langRef}>
      <button
        onClick={() => setIsLangOpen(!isLangOpen)}
        className={cn(
          'flex items-center justify-center gap-1.5 h-8 sm:h-9.5 px-2 sm:px-2.5 rounded-lg border border-(--border)',
          'bg-(--surface-1) text-(--foreground-muted) shadow-xs',
          'hover:text-(--foreground) hover:bg-(--surface-2) hover:border-(--border-strong)',
          'transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-(--primary-muted)/40 focus-visible:outline-none',
          isLangOpen && 'bg-(--surface-3) text-(--foreground) border-(--border-strong)'
        )}
        aria-label={`AI Response Language: ${language.toUpperCase()}. Click to change.`}
        aria-expanded={isLangOpen}
        aria-haspopup="listbox"
        title="AI Response Language (does not translate full UI)"
      >
        <Languages size={15} className="shrink-0 text-(--foreground-muted)" aria-hidden="true" />
        <span className="hidden md:inline text-[10px] font-bold font-mono tracking-wider">{language.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {isLangOpen && (
          <m.ul
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 bg-(--surface-1) border border-(--border) rounded-lg shadow-lg z-50 py-1 overflow-hidden"
            role="listbox"
            aria-label="Select AI Response Language"
          >
            {([
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
              { value: 'fr', label: 'Français' },
              { value: 'pt', label: 'Português' },
              { value: 'hi', label: 'हिंदी' },
            ] as { value: AssistantLanguage; label: string }[]).map(({ value, label }) => (
              <li
                key={value}
                role="option"
                aria-selected={language === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setLanguage(value);
                  setIsLangOpen(false);
                }}
                onClick={() => {
                  setLanguage(value);
                  setIsLangOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setLanguage(value);
                    setIsLangOpen(false);
                  }
                }}
                tabIndex={0}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs transition-colors',
                  language === value
                    ? 'bg-(--primary-muted) text-(--primary) font-semibold'
                    : 'text-(--foreground-muted) hover:bg-(--surface-2) hover:text-(--foreground)'
                )}
              >
                <span className="text-[9px] font-mono font-bold w-5 text-(--foreground-subtle)">
                  {value.toUpperCase()}
                </span>
                {label}
              </li>
            ))}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
