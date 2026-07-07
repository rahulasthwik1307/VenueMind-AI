import { PersonaMetadata } from '../types/persona';

export const PERSONAS: Record<string, PersonaMetadata> = {
  fan: {
    id: 'fan',
    name: 'Stadium Fan',
    description: 'Spectators seeking navigation, match schedules, facility availability, and safety announcements.',
    allowedFeatures: ['chat', 'map', 'alerts'],
  },
  volunteer: {
    id: 'volunteer',
    name: 'Event Volunteer',
    description: 'On-ground volunteers assisting with crowd management, user queries, and reporting minor incidents.',
    allowedFeatures: ['chat', 'map', 'alerts', 'report-incident'],
  },
  operations: {
    id: 'operations',
    name: 'Operations Team',
    description: 'Central operations center managing resources, coordinating emergency response, and viewing live status heatmaps.',
    allowedFeatures: ['chat', 'map', 'alerts', 'report-incident', 'manage-incidents', 'dashboard', 'timeline'],
  },
} as const;
