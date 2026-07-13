import { Sun, Moon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/components/providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center justify-center w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-lg border border-(--border)',
        'bg-(--surface-1) text-(--foreground-muted) shadow-xs',
        'hover:text-(--foreground) hover:bg-(--surface-2) hover:border-(--border-strong)',
        'transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-(--primary-muted)/40 focus-visible:outline-none'
      )}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? <Moon size={16} strokeWidth={2.25} /> : <Sun size={16} strokeWidth={2.25} />}
    </button>
  );
}
