'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIncident } from '@/hooks/useIncident';
import { IncidentTimeline } from '@/components/incident/IncidentTimeline';
import { m, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/modules/ui';
import { useShallow } from 'zustand/shallow';
import { SharedNotes } from '@/components/shared/SharedNotes';
import { IncidentDrawerHeader } from './IncidentDrawerHeader';
import { RelatedSystemsBadges } from './RelatedSystemsBadges';
import { IncidentDrawerAIIntelligence } from './IncidentDrawerAIIntelligence';
import { APP_CONFIG } from '@/constants/config';

export function IncidentDrawer() {
  const {
    incidents,
    analyses,
    activeIncidentId,
    filter,
    searchQuery,
    setActiveIncidentId,
    dispatchAction,
    markIncidentResolved,
    dismissRecommendation,
    addToast,
    addActivity,
  } = useIncident(
    useShallow((state) => ({
      incidents: state.incidents,
      analyses: state.analyses,
      activeIncidentId: state.activeIncidentId,
      filter: state.filter,
      searchQuery: state.searchQuery,
      setActiveIncidentId: state.setActiveIncidentId,
      dispatchAction: state.dispatchAction,
      markIncidentResolved: state.markIncidentResolved,
      dismissRecommendation: state.dismissRecommendation,
      addToast: state.addToast,
      addActivity: state.addActivity,
    }))
  );

  const {
    incidentNotes,
    incidentDrafts,
    setIncidentDraft,
    addIncidentNote,
    deleteIncidentNote,
  } = useUIStore(
    useShallow((state) => ({
      incidentNotes: state.incidentNotes,
      incidentDrafts: state.incidentDrafts,
      setIncidentDraft: state.setIncidentDraft,
      addIncidentNote: state.addIncidentNote,
      deleteIncidentNote: state.deleteIncidentNote,
    }))
  );

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const incident = activeIncidentId ? incidents.find((inc) => inc.id === activeIncidentId) : undefined;

  // Focus Close button for accessibility when drawer opens
  useEffect(() => {
    if (activeIncidentId) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, APP_CONFIG.DRAWER_FOCUS_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [activeIncidentId]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIncidentId(null);
      }
    };
    if (activeIncidentId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIncidentId, setActiveIncidentId]);

  if (!activeIncidentId) return null;
  if (!incident) return null;

  const currentDraft = incidentDrafts[incident.id] || '';
  const currentNotes = incidentNotes[incident.id] || [];

  const handleSaveNote = () => {
    if (!currentDraft.trim()) return;
    addIncidentNote(incident.id, currentDraft);
    addToast('Operator log note saved', 'success');
    addActivity(`Rahul Asthwik added a log note to incident ${incident.id.toUpperCase()}`, 'Rahul Asthwik', 'low');
  };

  const handleDeleteNote = (noteId: string) => {
    deleteIncidentNote(incident.id, noteId);
    addToast('Operator log note deleted', 'info');
  };

  const handleChangeDraft = (val: string) => {
    setIncidentDraft(incident.id, val);
  };

  const analysis = analyses[incident.id];

  // Derive filtered list to support Prev / Next navigation
  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'critical' && inc.severity !== 'critical') return false;
    if (filter === 'open' && inc.status !== 'open') return false;
    if (filter === 'investigating' && inc.status !== 'investigating') return false;
    if (filter === 'resolved' && inc.status !== 'resolved') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.location.zone.toLowerCase().includes(q) ||
        inc.category.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const currentIndex = filteredIncidents.findIndex((inc) => inc.id === incident.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < filteredIncidents.length - 1 && currentIndex !== -1;

  const handlePrev = () => {
    if (hasPrev) {
      setActiveIncidentId(filteredIncidents[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setActiveIncidentId(filteredIncidents[currentIndex + 1].id);
    }
  };

  const severityColor: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
    high: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-900',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300 dark:border-yellow-900',
    low: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900',
  };

  const statusColor: Record<string, string> = {
    open: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400',
    investigating: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400',
    resolved: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400',
  };

  // Systems Badge Configuration (operational badges)
  const systemStatus = {
    cctv: incident.status !== 'resolved' ? 'Active Feed' : 'Standby',
    security: incident.category === 'security' || incident.severity === 'critical' ? 'Dispatched' : 'Standby',
    medical: incident.category === 'medical' ? 'Dispatched' : 'Standby',
    transport: incident.category === 'transport' ? 'Monitoring' : 'Standby',
    volunteer: incident.category === 'volunteer' || incident.status === 'open' ? 'Active' : 'Standby',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Incident detail panel">
        {/* Backdrop overlay */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setActiveIncidentId(null)}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Drawer container */}
        <m.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            'relative w-full max-w-xl h-full flex flex-col',
            'bg-(--surface-1) border-l border-(--border) shadow-(--shadow-lg)'
          )}
        >
          {/* Drawer Header */}
          <IncidentDrawerHeader
            incident={incident}
            currentIndex={currentIndex}
            totalCount={filteredIncidents.length}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={handlePrev}
            onNext={handleNext}
            onClose={() => setActiveIncidentId(null)}
            closeButtonRef={closeButtonRef}
            severityColor={severityColor}
            statusColor={statusColor}
          />

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Title & Core Meta */}
            <div>
              <h3 className="text-base font-bold text-(--foreground) tracking-tight">
                {incident.title}
              </h3>
              <p className="text-xs text-(--foreground-subtle) mt-1 font-mono leading-none">
                Reporter: {incident.reporterId} · Zone: {incident.location.zone}
              </p>
              <p className="text-xs text-(--foreground-muted) mt-3 leading-relaxed">
                {incident.description}
              </p>
            </div>

            {/* Related Systems Section */}
            <RelatedSystemsBadges
              systemStatus={systemStatus}
            />

            {/* AI Situation Intelligence */}
            <IncidentDrawerAIIntelligence
              incident={incident}
              analysis={analysis}
              onExecute={(recId) => dispatchAction(incident.id, recId)}
              onDismiss={(recId) => dismissRecommendation(incident.id, recId)}
            />

            {/* Operator Notes Section */}
            <div className="border border-(--border) rounded-md p-4 bg-(--surface-2)">
              <h4 className="text-xs font-bold text-(--foreground) uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <FileText size={12} className="text-(--primary)" />
                Operator Log Notes
              </h4>
              <SharedNotes
                draft={currentDraft}
                notes={currentNotes}
                onChangeDraft={handleChangeDraft}
                onSave={handleSaveNote}
                onDelete={handleDeleteNote}
                placeholder="Type operator notes, findings, or local dispatch overrides here... (Ctrl+Enter to save)"
                historyTitle="Log History"
                ariaLabel="Operator incident log notes"
                maxHeightClass="max-h-28"
              />
            </div>

            {/* Incident Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-(--foreground) border-b border-(--border) pb-2">
                Operations Timeline
              </h4>
              <div className="max-h-60 overflow-y-auto pr-1.5 custom-scrollbar-always">
                <IncidentTimeline events={incident.timeline} />
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="shrink-0 px-5 py-4 border-t border-(--border) bg-(--surface-2) flex items-center justify-end gap-3">
            {incident.status === 'resolved' ? (
              <button
                disabled
                className={cn(
                  'flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded',
                  'border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400',
                  'cursor-not-allowed opacity-75'
                )}
                aria-label="Incident Resolved"
              >
                <CheckCircle size={13} />
                ✓ Resolved
              </button>
            ) : (
              <button
                onClick={() => markIncidentResolved(incident.id)}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white',
                  'active:scale-95 transition-all duration-150',
                  'focus-visible:outline-(--focus-ring)'
                )}
                aria-label="Mark Incident Resolved"
              >
                <CheckCircle size={13} />
                Mark Incident Resolved
              </button>
            )}
          </div>
        </m.div>
      </div>
    </AnimatePresence>
  );
}
