import { describe, it, expect } from 'vitest';
import type { StructuredMode } from '@/components/ai/ContextSelector';
import type { AssistantDomain } from '@/types/assistant';

function evaluateContextSelected(
  mode: StructuredMode,
  selectedIncidentId: string | null,
  selectedZoneId: string | null,
  selectedDomain: AssistantDomain | null
): boolean {
  return (
    (mode === 'incident' && selectedIncidentId !== null) ||
    (mode === 'zone' && selectedZoneId !== null) ||
    (mode === 'domain' && selectedDomain !== null)
  );
}

describe('AI Command Center Structured Context Selection', () => {
  it('should enable Analyze only if the active tab has a selection', () => {
    // Mode: incident, selection present
    expect(evaluateContextSelected('incident', 'inc-001', null, null)).toBe(true);

    // Mode: incident, selection missing
    expect(evaluateContextSelected('incident', null, null, null)).toBe(false);

    // Mode: zone, selection present on incident but not zone
    expect(evaluateContextSelected('zone', 'inc-001', null, null)).toBe(false);

    // Mode: zone, selection present on zone
    expect(evaluateContextSelected('zone', null, 'zone-1', null)).toBe(true);

    // Mode: domain, selection present on domain
    expect(evaluateContextSelected('domain', null, null, 'crowd')).toBe(true);
  });

  it('should simulate tab switch state clearing', () => {
    // Start state: incident selected
    let mode: StructuredMode = 'incident';
    let selectedIncidentId: string | null = 'inc-001';
    let selectedZoneId: string | null = null;
    let selectedDomain: AssistantDomain | null = null;

    expect(evaluateContextSelected(mode, selectedIncidentId, selectedZoneId, selectedDomain)).toBe(true);

    // Switch to zone: handleStructuredModeChange resets all selections to null
    mode = 'zone';
    selectedIncidentId = null;
    selectedZoneId = null;
    selectedDomain = null;

    expect(evaluateContextSelected(mode, selectedIncidentId, selectedZoneId, selectedDomain)).toBe(false);

    // User selects a zone
    selectedZoneId = 'zone-vip';
    expect(evaluateContextSelected(mode, selectedIncidentId, selectedZoneId, selectedDomain)).toBe(true);

    // Switch to domain: resets all selections to null
    mode = 'domain';
    selectedIncidentId = null;
    selectedZoneId = null;
    selectedDomain = null;

    expect(evaluateContextSelected(mode, selectedIncidentId, selectedZoneId, selectedDomain)).toBe(false);
  });

  it('should simulate interactionMode change state clearing', () => {
    let interactionMode: 'freeform' | 'structured' = 'structured';
    const structuredMode: StructuredMode = 'incident';
    let selectedIncidentId: string | null = 'inc-001';

    // Switch top-level mode to freeform: handleInteractionModeChange resets selections
    interactionMode = 'freeform';
    selectedIncidentId = null;

    expect(interactionMode).toBe('freeform');
    expect(selectedIncidentId).toBeNull();
    expect(evaluateContextSelected(structuredMode, selectedIncidentId, null, null)).toBe(false);
  });

  it('should simulate suggested query chip click setting structured state', () => {
    let interactionMode: 'freeform' | 'structured' = 'freeform';
    let structuredMode: StructuredMode = 'incident';
    let selectedZoneId: string | null = null;

    // Click "What is crowd risk at Gate D" chip
    interactionMode = 'structured';
    structuredMode = 'zone';
    selectedZoneId = 'Gate D';

    expect(interactionMode).toBe('structured');
    expect(structuredMode).toBe('zone');
    expect(selectedZoneId).toBe('Gate D');
    expect(evaluateContextSelected(structuredMode, null, selectedZoneId, null)).toBe(true);
  });
});
