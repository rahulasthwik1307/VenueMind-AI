import { cn } from '@/utils/cn';
import { SectionHeader } from '@/components/shared/SectionHeader';

interface PanelSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function PanelSection({ title, children, className }: PanelSectionProps) {
  return (
    <section
      className={cn(
        'px-4 py-2 border-b border-(--border) last:border-b-0',
        className
      )}
      aria-label={title}
    >
      <SectionHeader
        title={title}
        className="mb-1.5"
      />
      {children}
    </section>
  );
}
