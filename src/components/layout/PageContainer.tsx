import { cn } from '@/utils/cn';
import { DEFAULT_PAGE_PADDING, CONTENT_MAX_WIDTH } from '@/constants/layout';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * When false, removes max-width constraint.
   * Useful for full-bleed layouts like the stadium map.
   */
  constrained?: boolean;
}

/**
 * PageContainer — reusable responsive content wrapper for all pages.
 * Provides consistent padding, max-width, and scroll behavior.
 */
export function PageContainer({
  children,
  className,
  constrained = true,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full flex-1 overflow-y-auto',
        className
      )}
      style={{ padding: DEFAULT_PAGE_PADDING }}
    >
      <div
        className={cn('w-full h-full', constrained && 'mx-auto')}
        style={constrained ? { maxWidth: CONTENT_MAX_WIDTH } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
