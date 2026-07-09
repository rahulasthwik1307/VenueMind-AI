import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/store/modules/ui';

describe('useUIStore incident-scoped notes actions', () => {
  beforeEach(() => {
    // Reset state before each test to prevent pollution
    useUIStore.setState({
      incidentNotes: {},
      incidentDrafts: {},
      shiftNotes: [],
      operationsNotes: '',
    });
  });

  it('should isolate draft text per incident ID when switching or saving', () => {
    // Set draft for incident 1
    useUIStore.getState().setIncidentDraft('INC-1', 'Draft for incident 1');
    expect(useUIStore.getState().incidentDrafts['INC-1']).toBe('Draft for incident 1');
    expect(useUIStore.getState().incidentDrafts['INC-2']).toBeUndefined();

    // Set draft for incident 2
    useUIStore.getState().setIncidentDraft('INC-2', 'Draft for incident 2');
    expect(useUIStore.getState().incidentDrafts['INC-1']).toBe('Draft for incident 1');
    expect(useUIStore.getState().incidentDrafts['INC-2']).toBe('Draft for incident 2');
  });

  it('should add a note to one incident ID and ensure it does not appear under a different incident ID', () => {
    // Add note to incident 1
    useUIStore.getState().addIncidentNote('INC-1', 'Note for incident 1');

    const state = useUIStore.getState();
    expect(state.incidentNotes['INC-1']).toHaveLength(1);
    expect(state.incidentNotes['INC-1'][0].content).toBe('Note for incident 1');
    expect(state.incidentNotes['INC-1'][0].timestamp).toBeDefined();

    // Notes for incident 2 should be empty/undefined
    expect(state.incidentNotes['INC-2']).toBeUndefined();
    // Draft for incident 1 should be cleared
    expect(state.incidentDrafts['INC-1']).toBe('');
  });

  it('should remove only the targeted note and leave others for that incident intact upon deletion', () => {
    // Add multiple notes to incident 1
    useUIStore.getState().addIncidentNote('INC-1', 'Note A');
    useUIStore.getState().addIncidentNote('INC-1', 'Note B');
    useUIStore.getState().addIncidentNote('INC-1', 'Note C');

    let state = useUIStore.getState();
    expect(state.incidentNotes['INC-1']).toHaveLength(3);

    // Note history is newest first, so:
    // [0] = Note C, [1] = Note B, [2] = Note A
    const noteIdToDelete = state.incidentNotes['INC-1'][1].id; // Note B
    const remainingIds = [state.incidentNotes['INC-1'][0].id, state.incidentNotes['INC-1'][2].id];

    // Delete Note B
    useUIStore.getState().deleteIncidentNote('INC-1', noteIdToDelete);

    state = useUIStore.getState();
    expect(state.incidentNotes['INC-1']).toHaveLength(2);
    expect(state.incidentNotes['INC-1'].map(n => n.id)).toEqual(remainingIds);
    expect(state.incidentNotes['INC-1'].map(n => n.content)).toEqual(['Note C', 'Note A']);
  });
});
