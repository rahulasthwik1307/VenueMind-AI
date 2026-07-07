/**
 * Interactive Stadium Digital Twin — Page Entry
 *
 * Full-bleed layout: occupies the complete AppShell content area.
 * All state, logic, and layout is delegated to DigitalTwinLayout
 * which consumes the useDigitalTwin facade hook.
 */

import { DigitalTwinLayout } from '@/components/digitalTwin/DigitalTwinLayout';

export const metadata = {
  title: 'Digital Twin | VenueMind AI',
  description:
    'Interactive Stadium Digital Twin — real-time operational intelligence for FIFA World Cup 2026 stadium management.',
};

export default function DigitalTwinPage() {
  return (
    <div className="h-full overflow-hidden">
      <DigitalTwinLayout />
    </div>
  );
}

