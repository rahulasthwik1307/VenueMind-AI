'use client';

/**
 * DigitalTwinToolbar — Command Center Toolbar
 *
 * Full-width toolbar above the Digital Twin layout.
 * Contains:
 * - Match phase simulation indicator (synced with existing simulation engine)
 * - Overlay toggle buttons
 * - Zoom controls (delegates to StadiumCanvas)
 * - Live status summary
 * - Routes clear button
 */

import { m } from 'framer-motion';
import {
  Users,
  AlertTriangle,
  Navigation,
  Camera,
  Cloud,
  ParkingCircle,
  Bus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Activity,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { OverlayType } from '@/types/digitalTwin';
import type { MatchPeriod } from '@/types/telemetry';

interface DigitalTwinToolbarProps {
  matchPeriod: MatchPeriod | null;
  matchMinute: number;
  activeOverlays: Record<OverlayType, boolean>;
  routeCount: number;
  openIncidentCount: number;
  criticalCount: number;
  onToggleOverlay: (overlay: OverlayType) => void;
  onClearRoutes: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

const PERIOD_LABELS: Record<MatchPeriod, string> = {
  'pre-match': 'Pre-Match',
  'first-half': '1st Half',
  halftime: 'Half Time',
  'second-half': '2nd Half',
  'post-match': 'Post-Match',
};

const PERIOD_COLORS: Record<MatchPeriod, string> = {
  'pre-match': 'text-gray-500 bg-gray-100 border-gray-200',
  'first-half': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  halftime: 'text-amber-700 bg-amber-50 border-amber-200',
  'second-half': 'text-blue-700 bg-blue-50 border-blue-200',
  'post-match': 'text-gray-500 bg-gray-100 border-gray-200',
};

interface OverlayButtonConfig {
  id: OverlayType;
  label: string;
  icon: typeof Users;
  activeColor: string;
}

const OVERLAY_BUTTONS: OverlayButtonConfig[] = [
  { id: 'crowdDensity', label: 'Crowd', icon: Users, activeColor: 'text-blue-600 bg-blue-50 border-blue-300' },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle, activeColor: 'text-red-600 bg-red-50 border-red-300' },
  { id: 'routes', label: 'Routes', icon: Navigation, activeColor: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
  { id: 'cameras', label: 'Cameras', icon: Camera, activeColor: 'text-violet-600 bg-violet-50 border-violet-300' },
  { id: 'weather', label: 'Weather', icon: Cloud, activeColor: 'text-sky-600 bg-sky-50 border-sky-300' },
  { id: 'transport', label: 'Transport', icon: Bus, activeColor: 'text-amber-600 bg-amber-50 border-amber-300' },
  { id: 'parking', label: 'Parking', icon: ParkingCircle, activeColor: 'text-gray-600 bg-gray-100 border-gray-300' },
];

export function DigitalTwinToolbar({
  matchPeriod,
  matchMinute,
  activeOverlays,
  routeCount,
  openIncidentCount,
  criticalCount,
  onToggleOverlay,
  onClearRoutes,
  onZoomIn,
  onZoomOut,
  onResetView,
}: DigitalTwinToolbarProps) {
  const isLivePhase = matchPeriod === 'first-half' || matchPeriod === 'second-half';

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 border-b border-(--border) bg-(--surface-1) shrink-0 overflow-x-auto"
      role="toolbar"
      aria-label="Digital Twin controls"
    >
      {/* ── Stadium identity ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-(--border)">
        <Activity size={12} className="text-(--primary)" aria-hidden="true" />
        <span className="text-[10px] font-bold text-(--foreground) font-mono uppercase tracking-wide whitespace-nowrap">
          Digital Twin
        </span>
      </div>

      {/* ── Match phase indicator ───────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-1 pr-2 border-r border-(--border)">
        <span
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold font-mono uppercase tracking-wide whitespace-nowrap',
            matchPeriod ? PERIOD_COLORS[matchPeriod] : 'text-gray-400 bg-gray-50 border-gray-200',
          )}
          aria-label={`Match phase: ${matchPeriod ? PERIOD_LABELS[matchPeriod] : 'Unknown'}`}
        >
          {isLivePhase && (
            <m.span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              aria-hidden="true"
            />
          )}
          {matchPeriod ? PERIOD_LABELS[matchPeriod] : 'Loading…'}
          {isLivePhase && matchMinute > 0 && (
            <span className="opacity-70">· {matchMinute}&apos;</span>
          )}
        </span>
      </div>

      {/* ── Live incident summary ───────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-1.5 pr-2 border-r border-(--border)">
        {criticalCount > 0 && (
          <m.span
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold font-mono whitespace-nowrap"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            aria-live="polite"
            aria-label={`${criticalCount} critical incidents`}
          >
            <AlertTriangle size={8} aria-hidden="true" />
            {criticalCount} CRIT
          </m.span>
        )}
        <span className="text-[9px] font-mono text-(--foreground-subtle) whitespace-nowrap">
          {openIncidentCount} open
        </span>
      </div>

      {/* ── Overlay toggles ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1 pr-2 border-r border-(--border)">
        {OVERLAY_BUTTONS.map((btn) => {
          const Icon = btn.icon;
          const isActive = activeOverlays[btn.id];
          return (
            <button
              key={btn.id}
              onClick={() => onToggleOverlay(btn.id)}
              className={cn(
                'flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-semibold whitespace-nowrap transition-all duration-150',
                isActive
                  ? btn.activeColor
                  : 'text-(--foreground-subtle) bg-(--surface-2) border-(--border) hover:bg-(--surface-3)',
              )}
              aria-pressed={isActive}
              aria-label={`${isActive ? 'Hide' : 'Show'} ${btn.label} overlay`}
            >
              <Icon size={9} aria-hidden="true" />
              <span className="hidden sm:inline">{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Spacer ───────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Route management ────────────────────────────────────────── */}
      {routeCount > 0 && (
        <button
          onClick={onClearRoutes}
          className="flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-semibold text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100 transition-colors shrink-0"
          aria-label={`Clear ${routeCount} active route${routeCount !== 1 ? 's' : ''}`}
        >
          <Trash2 size={9} aria-hidden="true" />
          <span>Clear {routeCount} route{routeCount !== 1 ? 's' : ''}</span>
        </button>
      )}

      {/* ── Zoom controls ───────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={onZoomIn}
          className="p-1 rounded border border-(--border) bg-(--surface-2) hover:bg-(--surface-3) text-(--foreground-subtle) hover:text-(--foreground) transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={12} aria-hidden="true" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-1 rounded border border-(--border) bg-(--surface-2) hover:bg-(--surface-3) text-(--foreground-subtle) hover:text-(--foreground) transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={12} aria-hidden="true" />
        </button>
        <button
          onClick={onResetView}
          className="p-1 rounded border border-(--border) bg-(--surface-2) hover:bg-(--surface-3) text-(--foreground-subtle) hover:text-(--foreground) transition-colors"
          aria-label="Reset view to default"
        >
          <RotateCcw size={12} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
