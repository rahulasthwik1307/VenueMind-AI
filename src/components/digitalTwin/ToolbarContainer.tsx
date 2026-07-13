import { m } from 'framer-motion';
import type { Variants, Transition } from 'framer-motion';
import { DigitalTwinToolbar } from './DigitalTwinToolbar';
import type { OverlayType } from '@/types/digitalTwin';
import type { MatchPeriod } from '@/types/telemetry';

const stageTransition = (delay: number): Transition => ({
  duration: 0.35,
  ease: 'easeOut',
  delay,
});

const stageVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

interface ToolbarContainerProps {
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

export function ToolbarContainer({
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
}: ToolbarContainerProps) {
  return (
    <m.div
      variants={stageVariants}
      initial="hidden"
      animate="visible"
      transition={stageTransition(0)}
      className="shrink-0"
    >
      <DigitalTwinToolbar
        matchPeriod={matchPeriod}
        matchMinute={matchMinute}
        activeOverlays={activeOverlays}
        routeCount={routeCount}
        openIncidentCount={openIncidentCount}
        criticalCount={criticalCount}
        onToggleOverlay={onToggleOverlay}
        onClearRoutes={onClearRoutes}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetView={onResetView}
      />
    </m.div>
  );
}
