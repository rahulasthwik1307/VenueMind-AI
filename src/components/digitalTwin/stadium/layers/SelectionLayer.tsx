'use client';

/**
 * SelectionLayer — Zone Selection Highlight
 *
 * Renders the visual selection state on top of all other layers.
 * Draws a pulsing selection ring over the selected zone's path.
 */

import { m, AnimatePresence } from 'framer-motion';
import { StadiumZoneConfig } from '@/types/digitalTwin';

interface SelectionLayerProps {
  selectedZoneId: string | null;
  zones: StadiumZoneConfig[];
}

export function SelectionLayer({ selectedZoneId, zones }: SelectionLayerProps) {
  const selectedZone = selectedZoneId
    ? zones.find((z) => z.id === selectedZoneId)
    : null;

  return (
    <g aria-hidden="true" pointerEvents="none">
      <AnimatePresence mode="wait">
        {selectedZone && (
          <m.g
            key={selectedZone.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Outer glow ring */}
            <m.path
              d={selectedZone.svgPath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={8}
              opacity={0.5}
              animate={{
                strokeWidth: [8, 12, 8],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Inner selection ring */}
            <m.path
              d={selectedZone.svgPath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />

            {/* Focus point indicator */}
            <m.circle
              cx={selectedZone.focusPoint.x}
              cy={selectedZone.focusPoint.y}
              r={4}
              fill="var(--primary)"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </m.g>
        )}
      </AnimatePresence>
    </g>
  );
}
