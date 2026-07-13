import { CapacityWidget } from './CapacityWidget';
import { DateTimeDisplay } from './DateTimeDisplay';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from './NotificationCenter';
import { QuickActions } from './QuickActions';
import { OperatorProfile } from './OperatorProfile';

export function HeaderActions() {
  return (
    <div className="flex items-center justify-end gap-1 sm:gap-1.5 md:gap-2">
      <CapacityWidget />
      <DateTimeDisplay />
      <LanguageSelector />
      <ThemeToggle />
      <NotificationCenter />
      <QuickActions />
      
      {/* Divider */}
      <div
        className="hidden sm:block w-px h-6 bg-(--border-strong) mx-1"
        aria-hidden="true"
      />

      <OperatorProfile />
    </div>
  );
}
