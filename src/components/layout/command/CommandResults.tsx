import { useEffect, useRef } from 'react';
import type { CommandResult } from './CommandItem';
import { CommandItem } from './CommandItem';
import { CommandGroup } from './CommandGroup';
import { CommandEmptyState } from './CommandEmptyState';

interface CommandResultsProps {
  results: CommandResult[];
  activeIndex: number;
  query: string;
  onSelectResult: (result: CommandResult) => void;
  onHoverResult: (index: number) => void;
}

export function CommandResults({
  results,
  activeIndex,
  query,
  onSelectResult,
  onHoverResult,
}: CommandResultsProps) {
  const listRef = useRef<HTMLUListElement>(null);

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const activeEl = list.querySelector<HTMLLIElement>(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const firstIncidentIndex = results.findIndex((r) => r.kind === 'incident');
  const hasNav = results.some((r) => r.kind === 'nav');
  const hasIncidents = results.some((r) => r.kind === 'incident');

  return (
    <ul
      id="cmd-palette-results"
      ref={listRef}
      role="listbox"
      aria-label="Results"
      className="max-h-[min(420px,60vh)] overflow-y-auto py-2 px-2 space-y-0.5 custom-scrollbar-always"
    >
      {results.length === 0 && (
        <CommandEmptyState query={query} />
      )}

      {/* Navigate to — section header */}
      {hasNav && (
        <CommandGroup label="Navigate to" />
      )}

      {/* Results */}
      {results.map((result, index) => {
        const showIncidentHeader = hasIncidents && result.kind === 'incident' && index === firstIncidentIndex;

        return (
          <CommandItem
            key={result.id}
            result={result}
            isActive={activeIndex === index}
            index={index}
            onMouseEnter={() => onHoverResult(index)}
            onMouseDown={() => onSelectResult(result)}
            showIncidentHeader={showIncidentHeader}
          />
        );
      })}
    </ul>
  );
}
