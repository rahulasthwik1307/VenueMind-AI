import { describe, it, expect, beforeEach } from 'vitest';
import { useIncidentStore } from '@/store/modules/incident';

describe('useIncidentStore bulkUpdateIncidents', () => {
  beforeEach(() => {
    // Reset store before each test
    useIncidentStore.getState().resetAll();
  });

  it('should apply patch to specific incident IDs and leave others unchanged', () => {
    const store = useIncidentStore.getState();
    const initialIncidents = [...store.incidents];
    
    // Select first two incident IDs
    const targetIds = [initialIncidents[0].id, initialIncidents[1].id];
    
    // Bulk update status to 'resolved' and assignedTeam to 'Ops Team'
    store.bulkUpdateIncidents(targetIds, { status: 'resolved', assignedTeam: 'Ops Team' });
    
    const updatedIncidents = useIncidentStore.getState().incidents;
    
    // Check targets
    const updatedTargets = updatedIncidents.filter(i => targetIds.includes(i.id));
    expect(updatedTargets).toHaveLength(2);
    updatedTargets.forEach(incident => {
      expect(incident.status).toBe('resolved');
      expect(incident.assignedTeam).toBe('Ops Team');
    });
    
    // Check others remain unchanged
    const others = updatedIncidents.filter(i => !targetIds.includes(i.id));
    const initialOthers = initialIncidents.filter(i => !targetIds.includes(i.id));
    
    expect(others).toHaveLength(initialOthers.length);
    others.forEach((incident) => {
      const initialIncident = initialOthers.find(i => i.id === incident.id);
      expect(initialIncident).toBeDefined();
      expect(incident.status).toBe(initialIncident!.status);
      expect(incident.assignedTeam).toBe(initialIncident!.assignedTeam);
    });
  });

  it('should handle empty ID selection array gracefully', () => {
    const store = useIncidentStore.getState();
    const initialIncidents = [...store.incidents];
    
    store.bulkUpdateIncidents([], { status: 'resolved' });
    
    const updatedIncidents = useIncidentStore.getState().incidents;
    expect(updatedIncidents).toEqual(initialIncidents);
  });

  it('should handle partial patch fields', () => {
    const store = useIncidentStore.getState();
    const initialIncidents = [...store.incidents];
    
    const targetId = initialIncidents[0].id;
    const initialIncident = initialIncidents[0];
    
    // Patch only assignedTeam
    store.bulkUpdateIncidents([targetId], { assignedTeam: 'New Assigned Team' });
    
    const updated = useIncidentStore.getState().incidents.find(i => i.id === targetId)!;
    expect(updated.assignedTeam).toBe('New Assigned Team');
    expect(updated.status).toBe(initialIncident.status); // unchanged
  });
});
