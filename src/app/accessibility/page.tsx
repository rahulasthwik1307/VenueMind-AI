'use client';

import { useState } from 'react';
import { LensPageLayout } from '@/components/operations/LensPageLayout';
import { HelpingHand, AlertCircle, Info, Sparkles, ArrowUpDown, Users, Cpu, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AnimatePresence, m } from 'framer-motion';

interface RouteOption {
  steps: string[];
  elevator: string;
  volunteer: string;
  advisory: string;
}

interface ElevatorTelemetry {
  id: string;
  name: string;
  level: 'operational' | 'critical';
  note: string;
  currentFloor: string;
  capacity: string;
  queueStatus: 'Clear' | 'Low' | 'Moderate' | 'N/A';
  operationalState: string;
  lastVerification: string;
  estimatedResponseTime?: string;
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
  const elevators: ElevatorTelemetry[] = [
    {
      id: 'el-1',
      name: 'Elevator #1 (North)',
      level: 'operational' as const,
      note: 'NORMAL',
      currentFloor: 'L3',
      capacity: '15/20',
      queueStatus: 'Low',
      operationalState: 'Ascending',
      lastVerification: '14:35',
    },
    {
      id: 'el-2',
      name: 'Elevator #2 (South)',
      level: 'operational' as const,
      note: 'NORMAL',
      currentFloor: 'G',
      capacity: '4/20',
      queueStatus: 'Clear',
      operationalState: 'Idle',
      lastVerification: '14:22',
    },
    {
      id: 'el-3',
      name: 'Elevator #3 (VIP West)',
      level: 'critical' as const,
      note: 'DOOR LOCK FAULT',
      currentFloor: 'L2',
      capacity: '0/15',
      queueStatus: 'N/A',
      operationalState: 'Stuck (L2)',
      lastVerification: '14:20',
      estimatedResponseTime: '8 mins',
    },
    {
      id: 'el-4',
      name: 'Elevator #4 (VIP East)',
      level: 'operational' as const,
      note: 'NORMAL',
      currentFloor: 'L1',
      capacity: '12/15',
      queueStatus: 'Moderate',
      operationalState: 'Descending',
      lastVerification: '14:15',
    },
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
              <HelpingHand size={15} />
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
              <Users size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">Hosts Active</p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">45 Deployed</p>
            </div>
          </div>
        </div>
      }
      mainContent={
        <div className="border border-(--border) rounded-xl p-4 bg-(--surface-2)/20 space-y-3.5 h-full flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between border-b border-(--border)/60 pb-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-(--primary) shrink-0" />
              <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
                SCADA Lift Monitor
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono font-semibold text-(--foreground-muted)">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>ACTIVE SCANNING</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {elevators.map((el) => {
              const match = el.name.match(/(Elevator #\d+)\s*\((.+)\)/);
              const title = match ? match[1] : el.name;
              const location = match ? `(${match[2]})` : '';

              return (
                <div
                  key={el.id}
                  className={cn(
                    'flex flex-col p-3.5 rounded-lg border bg-(--surface-1) shadow-xs',
                    'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-(--border-strong) group',
                    el.level === 'critical'
                      ? 'border-red-500/20 dark:border-red-900/40 bg-red-500/2 dark:bg-red-950/3'
                      : 'border-(--border)'
                  )}
                  role="region"
                  aria-label={`${el.name} status: ${el.level === 'operational' ? 'Normal' : el.note}`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-(--border)/40 pb-2.5 mb-2.5 gap-1.5">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className={cn(
                        'w-2 h-2 rounded-full shrink-0 mt-1',
                        el.level === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                      )} />
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="text-xs font-bold text-(--foreground) tracking-tight">
                          {title}
                        </span>
                        {location && (
                          <span className="text-[10px] text-(--foreground-subtle) font-medium mt-0.5">
                            {location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 sm:self-start self-start pl-4 sm:pl-0 mt-0.5">
                      <ArrowUpDown size={11} className="text-(--foreground-subtle) group-hover:scale-y-110 transition-transform duration-200" />
                      <span className={cn(
                        'text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wide whitespace-nowrap',
                        el.level === 'critical'
                          ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/40 animate-pulse'
                          : 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-900/40'
                      )}>
                        {el.note}
                      </span>
                    </div>
                  </div>

                  {/* Card Telemetry Fields Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] flex-1">
                    <div className="flex justify-between items-center py-0.5 border-b border-(--border)/30">
                      <span className="text-(--foreground-muted) font-medium">Floor</span>
                      <span className="font-mono font-bold text-(--foreground) bg-(--surface-2)/60 px-1 py-0.2 rounded dark:bg-(--surface-2)/40">{el.currentFloor}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-(--border)/30">
                      <span className="text-(--foreground-muted) font-medium">State</span>
                      <span className={cn(
                        "font-mono font-semibold truncate text-right max-w-28",
                        el.level === 'critical' ? "text-red-500" : "text-(--foreground)"
                      )}>{el.operationalState}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-(--border)/30">
                      <span className="text-(--foreground-muted) font-medium">Capacity</span>
                      <span className="font-mono font-semibold text-(--foreground)">{el.capacity}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-(--border)/30">
                      <span className="text-(--foreground-muted) font-medium">Queue</span>
                      <span className={cn(
                        "font-mono font-semibold",
                        el.queueStatus === 'Moderate' ? "text-amber-500" : el.queueStatus === 'Low' || el.queueStatus === 'Clear' ? "text-green-500" : "text-(--foreground-subtle)"
                      )}>{el.queueStatus}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 col-span-2 text-[9.5px]">
                      <span className="text-(--foreground-muted) font-medium">Last Inspection</span>
                      <span className="font-mono text-(--foreground-subtle)">{el.lastVerification}</span>
                    </div>
                    {el.estimatedResponseTime && (
                      <div className="flex justify-between items-center py-1 col-span-2 bg-red-500/5 dark:bg-red-950/10 border border-red-500/10 dark:border-red-900/20 rounded-md px-2 mt-1 shadow-2xs">
                        <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          Response ETA
                        </span>
                        <span className="font-mono font-bold text-red-600 dark:text-red-400">{el.estimatedResponseTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
          <form onSubmit={handleGenerateRoute} className="space-y-4 font-sans text-xs flex-1 flex flex-col justify-between min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
              {/* Need */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="need-select" className="font-semibold text-(--foreground-muted)">
                  Visitor Need
                </label>
                <div className="relative">
                  <select
                    id="need-select"
                    value={need}
                    onChange={(e) => setNeed(e.target.value)}
                    className={cn(
                      "w-full h-11 pl-3.5 pr-10 border border-(--border) bg-(--surface-1) text-(--foreground) rounded-md appearance-none cursor-pointer shadow-xs",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)",
                      "hover:border-(--border-strong) transition-all duration-150 font-medium text-xs"
                    )}
                  >
                    <option value="mobility">Mobility (Wheelchair)</option>
                    <option value="sensory">Sensory (Low-Stimulus)</option>
                    <option value="visual">Visual Escort</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-(--foreground-subtle) flex items-center">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Start */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="start-select" className="font-semibold text-(--foreground-muted)">
                  Starting Location
                </label>
                <div className="relative">
                  <select
                    id="start-select"
                    value={startLoc}
                    onChange={(e) => setStartLoc(e.target.value)}
                    className={cn(
                      "w-full h-11 pl-3.5 pr-10 border border-(--border) bg-(--surface-1) text-(--foreground) rounded-md appearance-none cursor-pointer shadow-xs",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)",
                      "hover:border-(--border-strong) transition-all duration-150 font-medium text-xs"
                    )}
                  >
                    <option value="gate-a">Gate A (North Plaza)</option>
                    <option value="gate-c">Gate C (VIP East)</option>
                    <option value="gate-d">Gate D (South Plaza)</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-(--foreground-subtle) flex items-center">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dest-select" className="font-semibold text-(--foreground-muted)">
                  Target Seating
                </label>
                <div className="relative">
                  <select
                    id="dest-select"
                    value={targetSeat}
                    onChange={(e) => setTargetSeat(e.target.value)}
                    className={cn(
                      "w-full h-11 pl-3.5 pr-10 border border-(--border) bg-(--surface-1) text-(--foreground) rounded-md appearance-none cursor-pointer shadow-xs",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)",
                      "hover:border-(--border-strong) transition-all duration-150 font-medium text-xs"
                    )}
                  >
                    <option value="sec-110">North Stand Section 110</option>
                    <option value="sec-120">South Stand Section 120</option>
                    <option value="vip-4">VIP Suite 4</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-(--foreground-subtle) flex items-center">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Pre-Dispatch Briefing Panel or Result Panel */}
            <div aria-live="polite" className="flex-1 min-h-0 overflow-y-auto pr-0.5 my-2">
              <AnimatePresence mode="wait">
                {!generatedRoute ? (
                  <m.div
                    key="readiness-briefing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="bg-(--surface-1) border border-(--border) rounded-md p-5 space-y-5.5 text-left shadow-2xs"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-(--border)/45 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Sparkles size={13} className="text-(--primary) animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-(--primary) bg-(--primary-muted) px-2 py-0.5 rounded border border-(--primary-light)">
                          AI PRE-DISPATCH BRIEFING
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[8px] font-mono font-bold text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-900/30">
                        SYSTEM READY
                      </div>
                    </div>

                    {/* Briefing Checklist Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                      {/* Operator input checklist */}
                      <div className="space-y-2.5">
                        <span className="block text-[9px] font-mono font-bold text-(--foreground-subtle) uppercase tracking-wider">
                          1. Operator Inputs Required
                        </span>
                        <ul className="space-y-3 text-(--foreground-muted)">
                          <li className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-(--primary-muted) text-(--primary) flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span className="leading-normal">Select visitor requirements (mobility, sensory, visual)</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-(--primary-muted) text-(--primary) flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span className="leading-normal">Choose starting location plaza gates</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-(--primary-muted) text-(--primary) flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span className="leading-normal">Select target seating sector allocation</span>
                          </li>
                        </ul>
                      </div>

                      {/* System live checks */}
                      <div className="space-y-2.5">
                        <span className="block text-[9px] font-mono font-bold text-(--foreground-subtle) uppercase tracking-wider">
                          2. Model Inclusions Checked
                        </span>
                        <ul className="space-y-3 text-(--foreground-muted)">
                          <li className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-blue-950/20 text-blue-500 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                              ●
                            </span>
                            <span className="leading-normal">Generate optimal step-free path finding</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-green-950/20 text-green-500 flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span className="leading-normal">Verify live SCADA elevator telemetry feed</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-amber-950/20 text-amber-500 flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span className="leading-normal">Recommend host squad staffing dispatch</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="bg-(--surface-2)/45 rounded-md p-3.5 text-[10px] text-(--foreground-muted) text-center border border-(--border)/60 flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                      <span>Ready to query the inclusion model. Click below to execute dispatch.</span>
                    </div>
                  </m.div>
                ) : (
                  <m.div
                    key={`${need}-${startLoc}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="bg-(--surface-1) border border-(--border) rounded-md p-5 space-y-4 shadow-xs text-left"
                  >
                    <div className="flex items-center justify-between border-b border-(--border) pb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={12} className="text-(--primary) animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-(--primary) bg-(--primary-muted) px-2 py-0.5 rounded border border-(--primary-light)">
                          AI DISPATCH ROUTE GENERATED
                        </span>
                      </div>
                      <span className="text-[9px] text-(--foreground-subtle) font-mono uppercase tracking-wider">
                        FIFA Inclusion Protocol
                      </span>
                    </div>

                    {/* Flowchart Timeline for Route Instructions */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-mono font-bold text-(--foreground-subtle) uppercase tracking-wider">
                        Step-by-Step Guidance
                      </p>
                      <div className="flex flex-col">
                        {generatedRoute.steps.map((step, idx) => (
                          <div key={idx} className="relative flex items-start gap-3 pb-4 last:pb-0">
                            {/* Vertical connector line segment */}
                            {idx < generatedRoute.steps.length - 1 && (
                              <div className="absolute left-2.25 top-5 bottom-0 w-0.5 bg-(--border) dark:bg-slate-700/60 z-0" />
                            )}
                            
                            {/* Circular Number Badge */}
                            <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-(--surface-1) border border-(--border-strong) text-[10px] font-mono font-bold text-(--foreground) shrink-0 shadow-2xs">
                              {idx + 1}
                            </div>
                            <p className="text-xs text-(--foreground) leading-relaxed pt-0.5">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Telemetry Widget Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-b border-(--border)/60 py-3 mt-1.5 text-xs">
                      <div className="flex items-center gap-2.5 bg-(--surface-2)/35 border border-(--border)/50 rounded-md p-2 shadow-2xs">
                        <div className="w-7 h-7 rounded bg-(--primary-muted) text-(--primary) flex items-center justify-center shrink-0">
                          <Users size={13} />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[8px] font-mono font-bold text-(--foreground-subtle) uppercase leading-none">Assigned Host</span>
                          <span className="text-(--foreground) font-semibold mt-1 block truncate leading-tight">{generatedRoute.volunteer}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 bg-(--surface-2)/35 border border-(--border)/50 rounded-md p-2 shadow-2xs">
                        <div className="w-7 h-7 rounded bg-blue-950/20 text-blue-500 flex items-center justify-center shrink-0">
                          <ArrowUpDown size={13} />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[8px] font-mono font-bold text-(--foreground-subtle) uppercase leading-none">Lift Status</span>
                          <span className="text-(--foreground) font-semibold mt-1 block truncate leading-tight">{generatedRoute.elevator}</span>
                        </div>
                      </div>
                    </div>

                    {/* Advisory Notice Callout */}
                    <div className="bg-amber-500/3 dark:bg-amber-950/4 border border-amber-500/20 dark:border-amber-900/30 rounded-md p-3.5 flex items-start gap-2.5 shadow-2xs">
                      <Info size={14} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                      <div className="min-w-0">
                        <span className="block text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase leading-none">Operational Advisory</span>
                        <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed mt-1">
                          {generatedRoute.advisory}
                        </p>
                      </div>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button (44px target) */}
            <button
              type="submit"
              disabled={isGenerating}
              className={cn(
                'w-full h-11 flex items-center justify-center gap-2 rounded-md shrink-0',
                'bg-(--primary) text-white font-semibold cursor-pointer shadow-sm',
                'hover:bg-(--primary-hover) active:scale-[0.99] transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) group'
              )}
              aria-label="Generate accessibility route and accommodations"
            >
              <Cpu size={14} className="group-hover:rotate-12 transition-transform duration-200" />
              Generate Accommodation Route
            </button>
          </form>
        </div>
      }
    />
  );
}
