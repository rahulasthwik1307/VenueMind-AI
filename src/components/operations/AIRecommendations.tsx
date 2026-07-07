import { Brain, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { SkeletonCard } from '@/components/shared/SkeletonCard';

interface RecommendationCard {
  id: string;
  title: string;
  action: string;
  confidence: number;
  priority: 'critical' | 'high' | 'medium';
}

const PLACEHOLDER_RECOMMENDATIONS: RecommendationCard[] = [
  {
    id: 'rec-001',
    title: 'Redirect crowd from Gate 7 to Gate 9',
    action: 'Open Gate 9 north corridor and brief volunteer team',
    confidence: 94,
    priority: 'high',
  },
  {
    id: 'rec-002',
    title: 'Pre-position medical unit near Sector C',
    action: 'Deploy Unit 3 to medical bay C2 before halftime',
    confidence: 87,
    priority: 'medium',
  },
];

const PRIORITY_STYLES = {
  critical: 'border-l-red-600 bg-red-50/30',
  high: 'border-l-orange-500 bg-orange-50/20',
  medium: 'border-l-[var(--primary)] bg-[var(--primary-muted)]',
};

function Recommendation({ rec }: { rec: RecommendationCard }) {
  return (
    <div
      className={cn(
        'border border-(--border) border-l-4 rounded-md p-3.5',
        PRIORITY_STYLES[rec.priority]
      )}
      role="article"
      aria-label={`AI recommendation: ${rec.title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-(--foreground) leading-snug flex-1">
          {rec.title}
        </p>
        <span className="text-[10px] font-bold text-(--primary) bg-(--primary-light) px-1.5 py-0.5 rounded shrink-0 font-mono">
          {rec.confidence}%
        </span>
      </div>
      <p className="mt-1.5 text-[11px] text-(--foreground-muted) leading-relaxed">
        {rec.action}
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        <button
          className={cn(
            'flex items-center gap-1 text-[10px] font-semibold text-(--primary)',
            'px-2.5 py-1 rounded-sm bg-(--primary-muted)',
            'hover:bg-(--primary-light) transition-colors duration-150',
            'focus-visible:outline-(--focus-ring)'
          )}
          aria-disabled="true"
          aria-label={`Execute recommendation: ${rec.title} (AI command center coming soon)`}
        >
          Execute
          <ArrowRight size={10} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          className={cn(
            'text-[10px] font-medium text-(--foreground-muted)',
            'hover:text-(--foreground) transition-colors duration-150',
            'focus-visible:outline-(--focus-ring)'
          )}
          aria-disabled="true"
          aria-label="Dismiss recommendation"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function AIRecommendations() {
  const isLoading = false;

  return (
    <section
      className={cn(
        'bg-(--surface-1) border border-(--border) rounded-card p-5'
      )}
      aria-label="AI recommendations"
    >
      <SectionHeader
        title="AI Recommendations"
        description="Suggested actions based on current conditions"
        action={
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-(--primary-muted) border border-(--primary-light)"
            aria-label="AI powered recommendations"
          >
            <Sparkles size={10} strokeWidth={1.75} className="text-(--primary)" aria-hidden="true" />
            <span className="text-[9px] font-semibold text-(--primary) uppercase tracking-wide">
              AI
            </span>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard lines={3} hasHeader={false} />
          <SkeletonCard lines={3} hasHeader={false} />
        </div>
      ) : (
        <div className="space-y-3">
          {PLACEHOLDER_RECOMMENDATIONS.map((rec) => (
            <Recommendation key={rec.id} rec={rec} />
          ))}
        </div>
      )}

      <button
        className={cn(
          'mt-3 w-full flex items-center justify-center gap-1.5',
          'text-xs font-medium text-(--primary) hover:text-(--primary-hover)',
          'py-2 rounded-md hover:bg-(--primary-muted)',
          'transition-colors duration-150',
          'focus-visible:outline-(--focus-ring)'
        )}
        aria-label="Open AI command center (coming in next stage)"
        aria-disabled="true"
      >
        <Brain size={12} strokeWidth={1.75} aria-hidden="true" />
        Open AI Command Center
      </button>
    </section>
  );
}
