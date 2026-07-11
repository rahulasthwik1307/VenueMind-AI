'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ConfirmDialogProps {
  /** Controls dialog visibility. */
  isOpen: boolean;
  /** Short headline shown at the top of the dialog card. */
  title: string;
  /** Supporting body text that explains what will happen. */
  description: string;
  /** Label for the primary confirm action. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Label for the cancel/dismiss action. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Called when the user confirms the action. */
  onConfirm: () => void;
  /** Called when the user cancels (Escape key, Cancel button, or backdrop click). */
  onCancel: () => void;
}

/**
 * ConfirmDialog — General-purpose confirmation dialog.
 *
 * Accessibility:
 * - role="alertdialog", aria-modal="true"
 * - Focus is trapped inside while open; Cancel button receives initial focus.
 * - Escape key → cancel.
 * - Tab and Shift+Tab cycle only within the dialog.
 * - Focus is returned to the previously focused element on close.
 *
 * Styling:
 * - Matches VenueMind AI design system: --surface-1, --radius-card, --shadow-lg.
 * - Backdrop: bg-black/40 backdrop-blur-sm (consistent with MobileSidebarOverlay).
 * - Framer Motion scale + opacity entry/exit; respects prefers-reduced-motion.
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const prefersReducedMotion = useReducedMotion();

  // Refs for focus management
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Save and restore focus around dialog open/close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Delay to ensure AnimatePresence has rendered the dialog
      const timer = setTimeout(() => cancelButtonRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      // Return focus to the element that was active before the dialog opened
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Keyboard handling: Escape → cancel, Tab → trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      // Focus trap: keep Tab/Shift+Tab cycling within the two buttons
      if (e.key === 'Tab') {
        const focusable = [cancelButtonRef.current, confirmButtonRef.current].filter(
          Boolean,
        ) as HTMLButtonElement[];
        if (focusable.length < 2) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Animation variants — collapsed to no-op when user prefers reduced motion
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const cardVariants = prefersReducedMotion
    ? { hidden: {}, visible: {}, exit: {} }
    : {
        hidden: { opacity: 0, scale: 0.96, y: 8 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 8 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="confirm-dialog-backdrop"
          className="fixed inset-0 z-9998 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          // Clicking the backdrop cancels
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onCancel();
          }}
          aria-hidden="false"
        >
          {/* Backdrop layer */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Dialog card */}
          <m.div
            key="confirm-dialog-card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            className={cn(
              'relative z-10 w-full max-w-sm',
              'bg-(--surface-1) rounded-card',
              'border border-(--border-strong)',
              'shadow-(--shadow-lg)',
              'p-6 flex flex-col gap-4',
            )}
            variants={cardVariants}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {/* Icon + Title */}
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 mt-0.5 w-8 h-8 rounded-md bg-(--accent-muted) flex items-center justify-center"
                aria-hidden="true"
              >
                <AlertTriangle
                  size={15}
                  strokeWidth={2}
                  className="text-(--accent)"
                />
              </div>
              <div className="min-w-0">
                <h2
                  id="confirm-dialog-title"
                  className="text-sm font-semibold text-(--foreground) leading-snug"
                >
                  {title}
                </h2>
                <p
                  id="confirm-dialog-description"
                  className="mt-1 text-xs text-(--foreground-muted) leading-relaxed"
                >
                  {description}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                ref={cancelButtonRef}
                onClick={onCancel}
                className={cn(
                  'px-3.5 py-2 rounded-md text-xs font-medium',
                  'bg-(--surface-2) text-(--foreground-muted)',
                  'hover:bg-(--surface-3) hover:text-(--foreground)',
                  'border border-(--border)',
                  'transition-colors duration-150 cursor-pointer',
                  'focus-visible:outline-(--focus-ring)',
                )}
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmButtonRef}
                onClick={onConfirm}
                className={cn(
                  'px-3.5 py-2 rounded-md text-xs font-medium',
                  'bg-(--primary) text-white',
                  'hover:bg-(--primary-hover)',
                  'transition-colors duration-150 cursor-pointer',
                  'focus-visible:outline-(--focus-ring)',
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
