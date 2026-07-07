'use client';

import { useEffect } from 'react';
import type { OverlayType } from '@/types/digitalTwin';

interface KeyboardShortcutsProps {
  onToggleLeft?: () => void;
  onToggleAI?: () => void;
  onToggleOps?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
  onToggleOverlay?: (overlay: OverlayType) => void;
}

/**
 * useKeyboardShortcuts — Command Center Keyboard Hotkeys
 *
 * Extensible keyboard listener for professional operator workflows.
 * Mappings:
 *   - Ctrl + [  : Toggle Left Panel (Incident Queue)
 *   - Ctrl + ]  : Toggle AI Panel
 *   - Ctrl + \  : Toggle Operations Panel
 *   - = (or +)  : Zoom In
 *   - -         : Zoom Out
 *   - 0 (or Esc): Reset View
 *   - Alt + 1   : Toggle Crowd Density
 *   - Alt + 2   : Toggle Incidents
 *   - Alt + 3   : Toggle Routes
 *   - Alt + 4   : Toggle Cameras
 *   - Alt + 5   : Toggle Weather
 *   - Alt + 6   : Toggle Transport
 *   - Alt + 7   : Toggle Parking
 *   - Alt + 8   : Toggle Network Overlay
 */
export function useKeyboardShortcuts({
  onToggleLeft,
  onToggleAI,
  onToggleOps,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleOverlay,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      // Panel Toggles (Ctrl + keys)
      if (e.ctrlKey) {
        if (e.key === '[') {
          e.preventDefault();
          onToggleLeft?.();
        } else if (e.key === ']') {
          e.preventDefault();
          onToggleAI?.();
        } else if (e.key === '\\') {
          e.preventDefault();
          onToggleOps?.();
        }
        return;
      }

      // Overlay Toggles (Alt + 1..8)
      if (e.altKey && onToggleOverlay) {
        const overlayKeys: Record<string, OverlayType> = {
          '1': 'crowdDensity',
          '2': 'incidents',
          '3': 'routes',
          '4': 'cameras',
          '5': 'weather',
          '6': 'transport',
          '7': 'parking',
          '8': 'network',
        };
        if (overlayKeys[e.key]) {
          e.preventDefault();
          onToggleOverlay(overlayKeys[e.key]);
        }
        return;
      }

      // Zoom Controls
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        onZoomIn?.();
      } else if (e.key === '-') {
        e.preventDefault();
        onZoomOut?.();
      } else if (e.key === '0' || e.key === 'Escape') {
        e.preventDefault();
        onResetView?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onToggleLeft,
    onToggleAI,
    onToggleOps,
    onZoomIn,
    onZoomOut,
    onResetView,
    onToggleOverlay,
  ]);
}
