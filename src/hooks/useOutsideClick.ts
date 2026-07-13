import { useEffect } from 'react';
import type { RefObject } from 'react';

export function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: (event: MouseEvent) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, enabled]);
}
