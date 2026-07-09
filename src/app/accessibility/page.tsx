'use client';

import { useState } from 'react';
import { LensPageLayout } from '@/components/operations/LensPageLayout';
import { Accessibility, AlertCircle, Info, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RouteOption {
  steps: string[];
  elevator: string;
  volunteer: string;
  advisory: string;
}

const ROUTE_DATA: Record<string, RouteOption> = {
  'mobility-gate-a': {
    steps: [
      'Enter via Gate A (North Plaza) which features step-free ramp transition.',
      'Head straight toward the main concourse lobby and use Lift Lobby 1 (Operational).',
      'Ascend to Level 2 and proceed via the low-slope corridor toward Section 110.',
      'Accessible wheelchair deck is situated at row 12, spaces 1-4.',
    ],
    elevator: 'Elevator #1 (Operational)',
    volunteer: 'Host Team A (North Stand Coordinator)',
    advisory: 'Ensure elevator priority access is enforced. Strollers and helpers are permitted in designated spacing.',
  },
  'mobility-gate-c': {
    steps: [
      'Enter via VIP Gate C (East Side). Use the automatic double-door entry.',
      'Use VIP West Elevator #3 (Note: stuck between level 1 & 2 - alternative lift #4 operational).',
      'Take Elevator #4 to Suite level. Step-free corridor leads directly to VIP Suite 4.',
    ],
    elevator: 'Elevator #4 (Operational - Backup for elevator #3)',
    volunteer: 'VIP Host Squad B',
    advisory: 'Elevator #3 is currently stuck; update operator display signage at Gate C to redirect attendees to Lift #4.',
  },
  'sensory-gate-a': {
    steps: [
      'Enter via Gate A (North Plaza) during the recommended early arrival window.',
      'Low-sensory sensory pathway routes away from the main speaker array.',
      'Sensory-sensitive spectators can collect noise-canceling headphones at Fan Services Desk North.',
      'Proceed to quiet section seats at Section 110.',
    ],
    elevator: 'None required (Ground Level access)',
    volunteer: 'Inclusion Volunteer Lead',
    advisory: 'Provide sensory accommodation map. Point out the Quiet Room located at Sector D Concourse.',
  },
  'visual-gate-d': {
    steps: [
      'Enter via Gate D (South Stand). Tactile paving lines the entry lanes.',
      'An audio-guided host meets the guest at the ticket turnstile.',
      'Proceed to Lift Lobby 2 (Operational) and take elevator to Level 1.',
      'Escort guest safely to Section 120 accessible seating.',
    ],
    elevator: 'Elevator #2 (Operational)',
    volunteer: 'Host Squad D (Visual Escort Specialist)',
    advisory: 'Ensure transmitter for audio description is fully operational on channel 88.5 FM.',
  },
};

export default function AccessibilityPage() {
  // ── Dispatch Tool Form State ──────────────────────────────────────────────────
  const [need, setNeed] = useState<string>('mobility');
  const [startLoc, setStartLoc] = useState<string>('gate-a');
  const [targetSeat, setTargetSeat] = useState<string>('sec-110');
  
  const [generatedRoute, setGeneratedRoute] = useState<RouteOption | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // ── Seating metrics ──────────────────────────────────────────────────────────
  const totalAccessibleSpaces = 240;
  const occupiedSpaces = 116; // 48% occupied

  // Elevator telemetry status - Elevator #3 is stuck (inc-010 active)
  const elevators = [
    { id: 'el-1', name: 'Elevator #1 (North)', level: 'operational' as const, note: 'Normal' },
    { id: 'el-2', name: 'Elevator #2 (South)', level: 'operational' as const, note: 'Normal' },
    { id: 'el-3', name: 'Elevator #3 (VIP West)', level: 'critical' as const, note: 'Door Lock Fault' },
    { id: 'el-4', name: 'Elevator #4 (VIP East)', level: 'operational' as const, note: 'Normal' },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleGenerateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate minor react delay to demonstrate interactive trigger without simulated timeout
    const key = `${need}-${startLoc}`;
    const match = ROUTE_DATA[key] ?? ROUTE_DATA['mobility-gate-a'];
    setGeneratedRoute(match);
    setIsGenerating(false);
  };

  return (
    <LensPageLayout
      domain="accessibility"
      title="Accessibility & Inclusion Telemetry"
      description="Monitoring elevator status, wheelchair seating sectors, accessibility shuttle loops, and host dispatches"
      statusPills={[
        { label: 'TELEMETRY ACTIVE', level: 'operational' },
        { label: 'AA WCAG COMPLIANT', level: 'operational' },
      ]}
      footerConsoleStatusText="CONSOLE STATUS: OPERATIONAL"
      incidentFilter={(i) =>
        i.category === 'accessibility' ||
        i.id === 'inc-010' ||
        i.title.toLowerCase().includes('elevator') ||
        i.description.toLowerCase().includes('elevator') ||
        i.description.toLowerCase().includes('accessibility')
      }
      metrics={
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded bg-(--primary-muted) text-(--primary) flex items-center justify-center shrink-0">
              <Accessibility size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">A11y Seating</p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">
                {Math.round((occupiedSpaces / totalAccessibleSpaces) * 100)}%
              </p>
            </div>
          </div>

          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0">
              <AlertCircle size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">Elevator Faults</p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">1 Stuck</p>
            </div>
          </div>

          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded bg-blue-950/20 text-blue-500 flex items-center justify-center shrink-0">
              <Info size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">Hosts Active</p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">45 Deployed</p>
            </div>
          </div>
        </div>
      }
      mainContent={
        <div className="border border-(--border) rounded-xl p-4 bg-(--surface-2)/20 space-y-3 h-full flex flex-col justify-between shadow-sm">
          <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider shrink-0">
            SCADA Lift Monitor
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {elevators.map((el) => (
              <div
                key={el.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-md border bg-(--surface-1) shadow-xs',
                  el.level === 'critical'
                    ? 'border-red-100/60 dark:border-red-900/30 bg-red-50/10'
                    : 'border-(--border)'
                )}
                role="region"
                aria-label={`${el.name} elevator status: ${el.level === 'operational' ? 'Normal' : el.note}`}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', el.level === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-green-500')} />
                  <span className="text-xs font-bold text-(--foreground)">{el.name}</span>
                </div>
                <span className={cn(
                  'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border',
                  el.level === 'critical'
                    ? 'text-red-700 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/40 animate-pulse'
                    : 'text-green-700 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-950/20 dark:border-green-900/40'
                )}>
                  {el.note.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      }
      alertContent={
        <div className="border border-(--border) rounded-xl p-4 bg-(--surface-2)/20 space-y-4 h-full flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 border-b border-(--border) pb-2.5 shrink-0">
            <Sparkles size={14} className="text-(--primary)" />
            <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
              Tactical Accessibility Dispatch Tool
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerateRoute} className="space-y-4 font-sans text-xs flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Need */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="need-select" className="font-semibold text-(--foreground-muted)">
                  Visitor Need
                </label>
                <select
                  id="need-select"
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  className="h-11 px-3 border border-(--border) bg-(--surface-1) text-(--foreground) rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) cursor-pointer shadow-xs"
                >
                  <option value="mobility">Mobility (Wheelchair)</option>
                  <option value="sensory">Sensory (Low-Stimulus)</option>
                  <option value="visual">Visual Escort</option>
                </select>
              </div>

              {/* Start */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="start-select" className="font-semibold text-(--foreground-muted)">
                  Starting Location
                </label>
                <select
                  id="start-select"
                  value={startLoc}
                  onChange={(e) => setStartLoc(e.target.value)}
                  className="h-11 px-3 border border-(--border) bg-(--surface-1) text-(--foreground) rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) cursor-pointer shadow-xs"
                >
                  <option value="gate-a">Gate A (North Plaza)</option>
                  <option value="gate-c">Gate C (VIP East)</option>
                  <option value="gate-d">Gate D (South Plaza)</option>
                </select>
              </div>

              {/* Destination */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dest-select" className="font-semibold text-(--foreground-muted)">
                  Target Seating
                </label>
                <select
                  id="dest-select"
                  value={targetSeat}
                  onChange={(e) => setTargetSeat(e.target.value)}
                  className="h-11 px-3 border border-(--border) bg-(--surface-1) text-(--foreground) rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) cursor-pointer shadow-xs"
                >
                  <option value="sec-110">North Stand Section 110</option>
                  <option value="sec-120">South Stand Section 120</option>
                  <option value="vip-4">VIP Suite 4</option>
                </select>
              </div>
            </div>

            {/* Submit Button (44px target) */}
            <button
              type="submit"
              disabled={isGenerating}
              className={cn(
                'w-full h-11 flex items-center justify-center gap-2 rounded-md shrink-0',
                'bg-(--primary) text-white font-semibold cursor-pointer shadow-sm',
                'hover:bg-(--primary-hover) active:scale-[0.99] transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)'
              )}
              aria-label="Generate accessibility route and accommodations"
            >
              Generate Accommodation Route
            </button>
          </form>

          {/* Result Panel (aria-live polite) */}
          <div aria-live="polite" className="mt-4 shrink-0">
            {generatedRoute && (
              <div className="bg-(--surface-1) border border-(--border) rounded-md p-4 space-y-3.5 animate-fade-in shadow-xs">
                <div className="flex items-center justify-between border-b border-(--border) pb-2 flex-wrap gap-2">
                  <span className="text-[10px] font-mono font-bold text-(--primary) bg-(--primary-muted) px-2 py-0.5 rounded border border-(--primary-light)">
                    TACTICAL DISPATCH ROUTE GENERATED
                  </span>
                  <span className="text-[9px] text-(--foreground-subtle) font-mono uppercase">
                    FIFA Inclusion Guidelines
                  </span>
                </div>

                {/* Step list - Ordered List */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">Route Instructions</p>
                  <ol className="list-decimal pl-4.5 space-y-2 mt-1.5 text-xs text-(--foreground) leading-relaxed">
                    {generatedRoute.steps.map((step, idx) => (
                      <li key={idx} className="marker:font-mono marker:font-bold">{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-(--border) pt-3 mt-1 text-xs">
                  <div>
                    <span className="font-semibold text-(--foreground-muted)">Assigned Host: </span>
                    <span className="text-(--foreground) font-medium">{generatedRoute.volunteer}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-(--foreground-muted)">Lift Status: </span>
                    <span className="text-(--foreground) font-medium">{generatedRoute.elevator}</span>
                  </div>
                </div>

                {/* Advisory notice */}
                <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded p-3 flex items-start gap-2">
                  <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-800 dark:text-blue-400 leading-normal">
                    {generatedRoute.advisory}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
