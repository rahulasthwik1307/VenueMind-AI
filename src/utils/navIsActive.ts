/**
 * navIsActive — Pure helper for sidebar navigation active-state detection.
 *
 * Extracted from SidebarNavItem so the logic is independently testable
 * without Next.js hook dependencies.
 *
 * Rules:
 * - Exact match always activates the item.
 * - Prefix (startsWith) match activates the item for sub-routes.
 * - EXCEPTION: `'/'` (the landing page) must never prefix-match any
 *   operational route, so the startsWith branch is skipped for href === '/'.
 */
export function computeIsActive(itemHref: string, pathname: string): boolean {
  return (
    pathname === itemHref ||
    (itemHref !== '/' && pathname.startsWith(itemHref))
  );
}
