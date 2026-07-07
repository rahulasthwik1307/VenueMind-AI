export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'incident' | 'logistics' | 'security' | 'general';
  metadata?: Record<string, unknown>;
}
