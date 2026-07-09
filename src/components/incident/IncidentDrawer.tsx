'use client';

import { useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Brain,
  Shield,
  Activity,
  Bus,
  HeartHandshake,
  Video,
  AlertTriangle,
  Building,
  CheckCircle,
  AlertOctagon,
  FileText,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIncident } from '@/hooks/useIncident';
import { DecisionCard } from '@/components/cards/DecisionCard';
import { IncidentTimeline } from '@/components/incident/IncidentTimeline';
import { m, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/modules/ui';
import { SharedNotes } from '@/components/shared/SharedNotes';

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
  } = useIncident();

  const {
    incidentNotes,
    incidentDrafts,
    setIncidentDraft,
    addIncidentNote,
    deleteIncidentNote,
  } = useUIStore();

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const incident = activeIncidentId ? incidents.find((inc) => inc.id === activeIncidentId) : undefined;

  // Focus Close button for accessibility when drawer opens
  useEffect(() => {
    if (activeIncidentId) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
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
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-(--border)">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-(--foreground-subtle)">
                {incident.id.toUpperCase()}
              </span>
              <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0', severityColor[incident.severity])}>
                {incident.severity}
              </span>
              <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0', statusColor[incident.status])}>
                {incident.status}
              </span>
            </div>

            {/* Navigation and Close Controls */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Navigation with Positional Context */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-(--foreground-subtle) tracking-wider uppercase shrink-0">
                  {currentIndex + 1} of {filteredIncidents.length}
                </span>
                <div className="flex items-center border border-(--border) rounded-md overflow-hidden shrink-0 bg-(--surface-2)">
                  <button
                    onClick={handlePrev}
                    disabled={!hasPrev}
                    className={cn(
                      'p-1.5 hover:bg-(--surface-3) transition-colors text-(--foreground-muted) disabled:opacity-40 disabled:hover:bg-transparent',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)'
                    )}
                    aria-label="Previous Incident"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="w-px h-4 bg-(--border)" />
                  <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className={cn(
                      'p-1.5 hover:bg-(--surface-3) transition-colors text-(--foreground-muted) disabled:opacity-40 disabled:hover:bg-transparent',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)'
                    )}
                    aria-label="Next Incident"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="w-px h-4 bg-(--border)" aria-hidden="true" />

              <button
                ref={closeButtonRef}
                onClick={() => setActiveIncidentId(null)}
                className="p-1.5 rounded-md hover:bg-(--surface-3) transition-colors text-(--foreground-muted) hover:text-(--foreground) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                aria-label="Close incident details"
              >
                <X size={18} />
              </button>
            </div>
          </div>

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
            <div className="border border-(--border) rounded-md p-4 bg-(--surface-2)">
              <h4 className="font-semibold mb-3 uppercase tracking-wider text-[10px] text-(--foreground-muted)">
                Related Operational Systems
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'CCTV Feed', value: systemStatus.cctv, icon: Video, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900' },
                  { label: 'Security Unit', value: systemStatus.security, icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900' },
                  { label: 'Medical Dispatch', value: systemStatus.medical, icon: Activity, color: 'text-red-600', bg: 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900' },
                  { label: 'Transport Hub', value: systemStatus.transport, icon: Bus, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900' },
                  { label: 'Volunteer Comm', value: systemStatus.volunteer, icon: HeartHandshake, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-900' },
                ].map((sys) => {
                  const SysIcon = sys.icon;
                  const isActive = sys.value !== 'Standby';
                  return (
                    <div
                      key={sys.label}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[10px] font-semibold transition-all duration-150',
                        isActive ? sys.bg : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-900/10 dark:border-gray-800'
                      )}
                    >
                      <SysIcon size={11} className={isActive ? sys.color : 'text-gray-300'} />
                      <span>{sys.label}:</span>
                      <span className={cn('font-bold', isActive ? 'text-(--foreground)' : 'text-gray-400')}>
                        {sys.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Situation Summary Section */}
            {analysis && (
              <div className="border border-(--primary) border-opacity-30 rounded-md p-4 bg-green-50/20 dark:bg-green-950/5 relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                  <Brain size={80} className="text-(--primary)" />
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <Brain size={14} className="text-(--primary)" />
                  <h4 className="text-xs font-bold text-(--primary) uppercase tracking-wider">
                    AI Situation Intelligence
                  </h4>
                  {incident.aiConfidence && (
                    <span className="ml-auto text-[9px] font-bold bg-(--primary-light) dark:bg-green-900/40 text-(--primary) dark:text-green-300 px-1.5 py-0.5 rounded font-mono">
                      {incident.aiConfidence}% System Confidence
                    </span>
                  )}
                </div>

                <div className="space-y-3.5 text-[11px] leading-relaxed text-(--foreground-muted)">
                  <div>
                    <span className="font-semibold text-(--foreground) block">Situation Overview</span>
                    <p className="mt-0.5">{analysis.aiSituationSummary.explanation}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle size={11} /> Expected Operations Risks
                    </span>
                    <p className="mt-0.5">{analysis.aiSituationSummary.expectedRisks}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-(--primary) block">Recommended Tactical Response</span>
                    <p className="mt-0.5 text-(--foreground) font-medium">{analysis.aiSituationSummary.recommendedResponse}</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Decision Cards (Recommendations) */}
            {analysis && analysis.recommendations && analysis.recommendations.filter(r => !r.dismissed).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-(--foreground) flex items-center gap-1 border-b border-(--border) pb-2">
                  <AlertOctagon size={12} className="text-(--primary)" /> AI Tactical Recommendations
                </h4>
                <div className="space-y-3">
                  {analysis.recommendations.filter(r => !r.dismissed).map((rec) => (
                    <DecisionCard
                      key={rec.id}
                      recommendation={rec}
                      onExecute={() => dispatchAction(incident.id, rec.id)}
                      onDismiss={() => dismissRecommendation(incident.id, rec.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Impact & Nearby Facilities */}
            {analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estimated Impact */}
                <div className="border border-(--border) rounded-md p-4 bg-(--surface-2)">
                  <h4 className="text-xs font-semibold text-(--foreground) mb-2">Estimated Operational Impact</h4>
                  <p className="text-[11px] text-(--foreground-muted) leading-relaxed">
                    {analysis.estimatedImpact}
                  </p>
                </div>

                {/* Nearby Facilities */}
                <div className="border border-(--border) rounded-md p-4 bg-(--surface-2)">
                  <h4 className="text-xs font-semibold text-(--foreground) mb-2">Nearest Response Facilities</h4>
                  <ul className="space-y-2" aria-label="Nearby facilities">
                    {analysis.nearbyFacilities.map((fac) => (
                      <li key={fac.name} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-(--foreground-muted)">
                          <Building size={11} className="text-(--foreground-subtle)" />
                          {fac.name}
                        </span>
                        <span className="font-semibold font-mono text-(--foreground)">{fac.distance}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

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
