import { describe, it, expect } from 'vitest';
import { computeAvgResponseTime } from '@/components/incident/IncidentStatsStrip';
import type { Incident } from '@/types/incident';

describe('computeAvgResponseTime', () => {
  it('should return null when the incident list is empty', () => {
    expect(computeAvgResponseTime([])).toBeNull();
  });

  it('should return null when no incidents have a resolution timeline event', () => {
    const mockIncidents: Incident[] = [
      {
        id: 'inc-1',
        title: 'Incident 1',
        description: 'Test incident 1',
        status: 'open',
        severity: 'high',
        category: 'crowd',
        location: { lat: 0, lng: 0, zone: 'Zone A' },
        reporterId: 'user',
        createdAt: '2026-07-08T10:00:00.000Z',
        updatedAt: '2026-07-08T10:00:00.000Z',
        timeline: [
          { id: 'ev-1', title: 'Detection', description: 'Detected', timestamp: '2026-07-08T10:00:00.000Z', type: 'detection' }
        ],
      },
    ];
    expect(computeAvgResponseTime(mockIncidents)).toBeNull();
  });

  it('should compute correct average response time when resolution events are present', () => {
    const mockIncidents: Incident[] = [
      {
        id: 'inc-1',
        title: 'Incident 1',
        description: 'Test incident 1',
        status: 'resolved',
        severity: 'high',
        category: 'crowd',
        location: { lat: 0, lng: 0, zone: 'Zone A' },
        reporterId: 'user',
        createdAt: '2026-07-08T10:00:00.000Z',
        updatedAt: '2026-07-08T10:15:00.000Z',
        timeline: [
          { id: 'ev-1', title: 'Detection', description: 'Detected', timestamp: '2026-07-08T10:00:00.000Z', type: 'detection' },
          { id: 'ev-2', title: 'Resolved', description: 'Resolved by operator', timestamp: '2026-07-08T10:15:00.000Z', type: 'resolution' }
        ],
      },
      {
        id: 'inc-2',
        title: 'Incident 2',
        description: 'Test incident 2',
        status: 'resolved',
        severity: 'medium',
        category: 'medical',
        location: { lat: 0, lng: 0, zone: 'Zone B' },
        reporterId: 'user',
        createdAt: '2026-07-08T11:00:00.000Z',
        updatedAt: '2026-07-08T11:45:00.000Z',
        timeline: [
          { id: 'ev-3', title: 'Detection', description: 'Detected', timestamp: '2026-07-08T11:00:00.000Z', type: 'detection' },
          { id: 'ev-4', title: 'Resolved', description: 'Resolved by medic', timestamp: '2026-07-08T11:45:00.000Z', type: 'resolution' }
        ],
      },
    ];
    // inc-1 response time = 15 mins
    // inc-2 response time = 45 mins
    // Avg = (15 + 45) / 2 = 30 mins
    expect(computeAvgResponseTime(mockIncidents)).toBe(30);
  });

  it('should round the calculated average to the nearest integer', () => {
    const mockIncidents: Incident[] = [
      {
        id: 'inc-1',
        title: 'Incident 1',
        description: 'Test incident 1',
        status: 'resolved',
        severity: 'high',
        category: 'crowd',
        location: { lat: 0, lng: 0, zone: 'Zone A' },
        reporterId: 'user',
        createdAt: '2026-07-08T10:00:00.000Z',
        updatedAt: '2026-07-08T10:10:00.000Z',
        timeline: [
          { id: 'ev-1', title: 'Resolved', description: 'Resolved', timestamp: '2026-07-08T10:10:00.000Z', type: 'resolution' }
        ],
      },
      {
        id: 'inc-2',
        title: 'Incident 2',
        description: 'Test incident 2',
        status: 'resolved',
        severity: 'medium',
        category: 'medical',
        location: { lat: 0, lng: 0, zone: 'Zone B' },
        reporterId: 'user',
        createdAt: '2026-07-08T11:00:00.000Z',
        updatedAt: '2026-07-08T11:15:00.000Z',
        timeline: [
          { id: 'ev-2', title: 'Resolved', description: 'Resolved', timestamp: '2026-07-08T11:15:00.000Z', type: 'resolution' }
        ],
      },
      {
        id: 'inc-3',
        title: 'Incident 3',
        description: 'Test incident 3',
        status: 'resolved',
        severity: 'low',
        category: 'transport',
        location: { lat: 0, lng: 0, zone: 'Zone C' },
        reporterId: 'user',
        createdAt: '2026-07-08T12:00:00.000Z',
        updatedAt: '2026-07-08T12:12:00.000Z',
        timeline: [
          { id: 'ev-3', title: 'Resolved', description: 'Resolved', timestamp: '2026-07-08T12:12:00.000Z', type: 'resolution' }
        ],
      },
    ];
    // inc-1 = 10 mins
    // inc-2 = 15 mins
    // inc-3 = 12 mins
    // Avg = (10 + 15 + 12) / 3 = 12.333... -> rounded to 12
    expect(computeAvgResponseTime(mockIncidents)).toBe(12);
  });

  it('should ignore resolution events with timestamp before creation time', () => {
    const mockIncidents: Incident[] = [
      {
        id: 'inc-1',
        title: 'Incident 1',
        description: 'Test incident 1',
        status: 'resolved',
        severity: 'high',
        category: 'crowd',
        location: { lat: 0, lng: 0, zone: 'Zone A' },
        reporterId: 'user',
        createdAt: '2026-07-08T10:00:00.000Z',
        updatedAt: '2026-07-08T09:50:00.000Z',
        timeline: [
          { id: 'ev-1', title: 'Resolved', description: 'Resolved', timestamp: '2026-07-08T09:50:00.000Z', type: 'resolution' }
        ],
      },
    ];
    expect(computeAvgResponseTime(mockIncidents)).toBeNull();
  });
});
