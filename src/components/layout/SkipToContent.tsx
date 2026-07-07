/**
 * SkipToContent — keyboard accessibility shortcut.
 * Visually hidden until focused, then jumps to main content.
 * Must be the very first focusable element in the DOM.
 */

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      aria-label="Skip to main content"
    >
      Skip to content
    </a>
  );
}
