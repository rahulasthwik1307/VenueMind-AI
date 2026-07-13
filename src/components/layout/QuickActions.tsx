import Link from 'next/link';
import { Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';

export function QuickActions() {
  const router = useRouter();

  const handleExit = () => {
    router.push(ROUTES.landing);
  };

  return (
    <>
      {/* Settings */}
      <Link
        href="/settings"
        className={cn(
          'hidden sm:flex items-center justify-center w-9.5 h-9.5 rounded-lg border border-(--border)',
          'bg-(--surface-1) text-(--foreground-muted) shadow-xs',
          'hover:text-(--foreground) hover:bg-(--surface-2) hover:border-(--border-strong)',
          'transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-(--primary-muted)/40 focus-visible:outline-none'
        )}
        aria-label="Open settings"
      >
        <Settings size={15} aria-hidden="true" />
      </Link>

      {/* Exit Button */}
      <button
        onClick={handleExit}
        className={cn(
          'flex items-center justify-center w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-lg border border-(--border)',
          'bg-(--surface-1) text-(--foreground-muted) shadow-xs cursor-pointer',
          'hover:text-(--foreground) hover:bg-(--surface-2) hover:border-(--border-strong)',
          'transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-(--primary-muted)/40 focus-visible:outline-none'
        )}
        aria-label="Return to landing page"
        title="Exit to landing page"
      >
        <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </>
  );
}
