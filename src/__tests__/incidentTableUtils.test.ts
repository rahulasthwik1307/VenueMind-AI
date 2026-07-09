import { describe, it, expect } from 'vitest';
import {
  sortIncidents,
  filterIncidents,
  type IncidentFilters,
} from '@/utils/incidentTableUtils';
import type { Incident } from '@/types/incident';

const mockIncidents: Incident[] = [
  {
    id: 'inc-1',
    title: 'Crowd Gate 7 Overcrowded',
    description: 'Turnstile gate 7 bottleneck.',
    status: 'open',
    severity: 'critical',
    category: 'crowd',
    location: { lat: 10, lng: 10, zone: 'Gate 7' },
    reporterId: 'admin',
    createdAt: '2026-07-08T10:00:00.000Z',
    updatedAt: '2026-07-08T10:00:00.000Z',
    assignedTeam: 'Crowd Control',
    timeline: [],
  },
  {
    id: 'inc-2',
    title: 'Medic Dispatch to Row 5',
    description: 'Heat exhaustion row 5.',
    status: 'investigating',
    severity: 'high',
    category: 'medical',
    location: { lat: 10.1, lng: 10.1, zone: 'Row 5 Section B' },
    reporterId: 'sensor',
    createdAt: '2026-07-08T09:30:00.000Z',
    updatedAt: '2026-07-08T09:30:00.000Z',
    assignedTeam: 'Medical team B',
    timeline: [],
  },
  {
    id: 'inc-3',
    title: 'Elevator Outage',
    description: 'Elevator power cut.',
    status: 'resolved',
    severity: 'medium',
    category: 'infrastructure',
    location: { lat: 10.2, lng: 10.2, zone: 'Elevator Lobby 3' },
    reporterId: 'sensor',
    createdAt: '2026-07-08T11:00:00.000Z',
    updatedAt: '2026-07-08T11:00:00.000Z',
    assignedTeam: 'Infra maintenance',
    timeline: [],
  },
  {
    id: 'inc-4',
    title: 'Bus Shuttle Late',
    description: 'Corridor B shuttle delayed by 15 mins.',
    status: 'mitigated',
    severity: 'low',
    category: 'transport',
    location: { lat: 10.3, lng: 10.3, zone: 'Corridor B Hub' },
    reporterId: 'admin',
    createdAt: '2026-07-08T08:00:00.000Z',
    updatedAt: '2026-07-08T08:00:00.000Z',
    assignedTeam: 'Transport Team',
    timeline: [],
  },
];

describe('incidentTableUtils - sortIncidents', () => {
  it('should sort by severity desc (critical > high > medium > low) by default', () => {
    const result = sortIncidents(mockIncidents, 'severity', 'desc');
    expect(result.map(i => i.id)).toEqual(['inc-1', 'inc-2', 'inc-3', 'inc-4']);
  });

  it('should sort by severity asc (low < medium < high < critical)', () => {
    const result = sortIncidents(mockIncidents, 'severity', 'asc');
    expect(result.map(i => i.id)).toEqual(['inc-4', 'inc-3', 'inc-2', 'inc-1']);
  });

  it('should sort by time desc (newest first)', () => {
    const result = sortIncidents(mockIncidents, 'time', 'desc');
    expect(result.map(i => i.id)).toEqual(['inc-3', 'inc-1', 'inc-2', 'inc-4']);
  });

  it('should sort by time asc (oldest first)', () => {
    const result = sortIncidents(mockIncidents, 'time', 'asc');
    expect(result.map(i => i.id)).toEqual(['inc-4', 'inc-2', 'inc-1', 'inc-3']);
  });

  it('should sort by status desc (open > investigating > mitigated > resolved)', () => {
    const result = sortIncidents(mockIncidents, 'status', 'desc');
    expect(result.map(i => i.id)).toEqual(['inc-1', 'inc-2', 'inc-4', 'inc-3']);
  });

  it('should sort by status asc (resolved < mitigated < investigating < open)', () => {
    const result = sortIncidents(mockIncidents, 'status', 'asc');
    expect(result.map(i => i.id)).toEqual(['inc-3', 'inc-4', 'inc-2', 'inc-1']);
  });
});

describe('incidentTableUtils - filterIncidents', () => {
  const baseFilters: IncidentFilters = {
    severities: [],
    categories: [],
    statuses: [],
    zone: 'all',
    emergencyMode: false,
  };

  it('should return all incidents when no filter or search is active', () => {
    const result = filterIncidents(mockIncidents, baseFilters, '');
    expect(result).toHaveLength(4);
  });

  it('should filter by severity', () => {
    const result = filterIncidents(mockIncidents, { ...baseFilters, severities: ['high'] }, '');
    expect(result.map(i => i.id)).toEqual(['inc-2']);
  });

  it('should filter by category', () => {
    const result = filterIncidents(mockIncidents, { ...baseFilters, categories: ['transport'] }, '');
    expect(result.map(i => i.id)).toEqual(['inc-4']);
  });

  it('should filter by status', () => {
    const result = filterIncidents(mockIncidents, { ...baseFilters, statuses: ['mitigated'] }, '');
    expect(result.map(i => i.id)).toEqual(['inc-4']);
  });

  it('should filter by zone', () => {
    const result = filterIncidents(mockIncidents, { ...baseFilters, zone: 'Gate 7' }, '');
    expect(result.map(i => i.id)).toEqual(['inc-1']);
  });

  it('should filter by zone case-insensitively and partially', () => {
    const result = filterIncidents(mockIncidents, { ...baseFilters, zone: 'elevator' }, '');
    expect(result.map(i => i.id)).toEqual(['inc-3']);
  });

  it('should filter by search query (matches title)', () => {
    const result = filterIncidents(mockIncidents, baseFilters, 'Medic');
    expect(result.map(i => i.id)).toEqual(['inc-2']);
  });

  it('should filter by search query (matches zone)', () => {
    const result = filterIncidents(mockIncidents, baseFilters, 'Row 5');
    expect(result.map(i => i.id)).toEqual(['inc-2']);
  });

  it('should filter by search query (matches description)', () => {
    const result = filterIncidents(mockIncidents, baseFilters, 'bottleneck');
    expect(result.map(i => i.id)).toEqual(['inc-1']);
  });

  it('should filter by search query (matches category)', () => {
    const result = filterIncidents(mockIncidents, baseFilters, 'transport');
    expect(result.map(i => i.id)).toEqual(['inc-4']);
  });

  it('should filter by search query (matches assignedTeam)', () => {
    const result = filterIncidents(mockIncidents, baseFilters, 'Maintenance');
    expect(result.map(i => i.id)).toEqual(['inc-3']);
  });

  it('should support combined filtering and searching', () => {
    const filters: IncidentFilters = {
      ...baseFilters,
      severities: ['critical'],
    };
    const result = filterIncidents(mockIncidents, filters, 'gate');
    expect(result.map(i => i.id)).toEqual(['inc-1']);
  });

  it('should return empty list when no matches are found', () => {
    const result = filterIncidents(mockIncidents, baseFilters, 'Nonexistent query');
    expect(result).toHaveLength(0);
  });
});
