import { describe, it, expect } from 'vitest';
import type { Incident } from '@/types/incident';

// Define the exact filter functions used in our lens pages to test them purely
const crowdFilter = (i: Incident) => i.category === 'crowd';

const transportFilter = (i: Incident) => i.category === 'transport';

const emergencyFilter = (i: Incident) =>
  i.severity === 'critical' ||
  i.category === 'security' ||
  i.category === 'medical' ||
  i.category === 'weather';

const accessibilityFilter = (i: Incident) =>
  i.category === 'accessibility' ||
  i.id === 'inc-010' ||
  i.title.toLowerCase().includes('elevator') ||
  i.description.toLowerCase().includes('elevator') ||
  i.description.toLowerCase().includes('accessibility');

// Mock incident database for tests
const mockIncidents: Incident[] = [
  {
    id: 'inc-crowd',
    title: 'Crowd congestion',
    description: 'Congestion at gate 7 plaza.',
    status: 'open',
    severity: 'high',
    category: 'crowd',
    location: { lat: 25.4, lng: 51.3, zone: 'Zone A' },
    reporterId: 'sys-sensor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTeam: 'Security',
    timeline: [],
  },
  {
    id: 'inc-transport',
    title: 'Bus delay',
    description: 'Shuttle delays at junction.',
    status: 'open',
    severity: 'low',
    category: 'transport',
    location: { lat: 25.4, lng: 51.3, zone: 'Zone B' },
    reporterId: 'sys-sensor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTeam: 'Transport',
    timeline: [],
  },
  {
    id: 'inc-critical-infra',
    title: 'SCADA panel fire threat',
    description: 'Critical smoke sensor activation in generator room.',
    status: 'open',
    severity: 'critical',
    category: 'infrastructure',
    location: { lat: 25.4, lng: 51.3, zone: 'Zone C' },
    reporterId: 'sys-sensor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTeam: 'IT Support',
    timeline: [],
  },
  {
    id: 'inc-security-medium',
    title: 'Unattended bag',
    description: 'Suspicious backpack near concrete planters.',
    status: 'open',
    severity: 'medium',
    category: 'security',
    location: { lat: 25.4, lng: 51.3, zone: 'Zone D' },
    reporterId: 'sys-sensor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTeam: 'QRT Security',
    timeline: [],
  },
  {
    id: 'inc-medical',
    title: 'Dehydration row 14',
    description: 'Spectator shows signs of heat exhaustion.',
    status: 'investigating',
    severity: 'medium',
    category: 'medical',
    location: { lat: 25.4, lng: 51.3, zone: 'Zone E' },
    reporterId: 'sys-sensor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTeam: 'Medical Unit 3',
    timeline: [],
  },
  {
    id: 'inc-010',
    title: 'Elevator mechanical fault at VIP West',
    description: 'SCADA elevator #3 stuck between levels.',
    status: 'investigating',
    severity: 'high',
    category: 'infrastructure',
    location: { lat: 25.4, lng: 51.3, zone: 'Zone F' },
    reporterId: 'sys-sensor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTeam: 'Elevator Tech',
    timeline: [],
  },
  {
    id: 'inc-accessibility-generic',
    title: 'Wheelchair lift platform sensor error',
    description: 'Lift sensor E-12 disabled.',
    status: 'open',
    severity: 'low',
    category: 'accessibility',
    location: { lat: 25.4, lng: 51.3, zone: 'Zone G' },
    reporterId: 'sys-sensor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTeam: 'Inclusion Team',
    timeline: [],
  },
  {
    id: 'inc-weather',
    title: 'Lightning storm hazard alert',
    description: 'Severe weather approaching.',
    status: 'open',
    severity: 'medium',
    category: 'weather',
    location: { lat: 25.4, lng: 51.3, zone: 'Zone H' },
    reporterId: 'sys-sensor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTeam: 'Ops command',
    timeline: [],
  },
  {
    id: 'inc-unrelated',
    title: 'Lost child reunion request',
    description: 'Lucas is waiting at services.',
    status: 'resolved',
    severity: 'low',
    category: 'volunteer',
    location: { lat: 25.4, lng: 51.3, zone: 'Zone I' },
    reporterId: 'sys-sensor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTeam: 'Volunteers',
    timeline: [],
  },
];

describe('Domain Filtering Logic Unit Tests', () => {
  it('should filter Crowd Monitoring incidents correctly', () => {
    const result = mockIncidents.filter(crowdFilter);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('inc-crowd');
  });

  it('should filter Transport incidents correctly', () => {
    const result = mockIncidents.filter(transportFilter);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('inc-transport');
  });

  it('should filter Emergency incidents correctly (critical severity OR security/medical/weather categories)', () => {
    const result = mockIncidents.filter(emergencyFilter);
    // Should include:
    // 1. inc-critical-infra (severity: critical)
    // 2. inc-security-medium (category: security)
    // 3. inc-medical (category: medical)
    // 4. inc-weather (category: weather)
    // Should exclude others.
    expect(result).toHaveLength(4);
    
    const ids = result.map((i) => i.id);
    expect(ids).toContain('inc-critical-infra');
    expect(ids).toContain('inc-security-medium');
    expect(ids).toContain('inc-medical');
    expect(ids).toContain('inc-weather');
  });

  it('should filter Accessibility incidents correctly (category accessibility OR elevator/a11y texts OR inc-010)', () => {
    const result = mockIncidents.filter(accessibilityFilter);
    // Should include:
    // 1. inc-010 (exact ID matching VIP Elevator fault)
    // 2. inc-accessibility-generic (category matching 'accessibility')
    // Should exclude others (like inc-unrelated, inc-crowd, etc.)
    expect(result).toHaveLength(2);

    const ids = result.map((i) => i.id);
    expect(ids).toContain('inc-010');
    expect(ids).toContain('inc-accessibility-generic');
  });

  it('should handle incidents matching none of the domain criteria (correct exclusion)', () => {
    const crowdRes = crowdFilter(mockIncidents.find((i) => i.id === 'inc-unrelated')!);
    const transRes = transportFilter(mockIncidents.find((i) => i.id === 'inc-unrelated')!);
    const emergRes = emergencyFilter(mockIncidents.find((i) => i.id === 'inc-unrelated')!);
    const accessRes = accessibilityFilter(mockIncidents.find((i) => i.id === 'inc-unrelated')!);

    expect(crowdRes).toBe(false);
    expect(transRes).toBe(false);
    expect(emergRes).toBe(false);
    expect(accessRes).toBe(false);
  });

  it('should handle multi-match scenarios correctly', () => {
    // If an incident is marked critical AND category security/medical, it shows in emergency.
    // If an elevator incident is also marked critical, it should appear in both emergency (critical) and accessibility (elevator keyword).
    const multiMatchIncident: Incident = {
      id: 'inc-critical-elevator-fire',
      title: 'Critical Elevator Fire Incident',
      description: 'Severe electrical fire in Elevator West shaft.',
      status: 'open',
      severity: 'critical',
      category: 'security', // maps to emergency
      location: { lat: 25.4, lng: 51.3, zone: 'Zone A' },
      reporterId: 'sensor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTeam: 'Fire Crew',
      timeline: [],
    };

    expect(emergencyFilter(multiMatchIncident)).toBe(true); // matches 'critical' severity and 'security' category
    expect(accessibilityFilter(multiMatchIncident)).toBe(true); // matches 'Elevator' title keyword
  });
});
