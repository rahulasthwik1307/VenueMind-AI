/**
 * Stadium Zone Configuration
 *
 * Centralized data source for the Interactive Stadium Digital Twin.
 * All SVG paths, label positions, focus points, and zone metadata
 * are defined here. Components render from this config — no coordinates
 * embedded inside component files.
 *
 * SVG ViewBox: 0 0 800 620
 * Stadium center: cx=400, cy=308
 * Outer boundary: rx=310, ry=243
 * Inner track boundary: rx=242, ry=186
 * Pitch: x=282, y=230, width=236, height=152
 *
 * Stand arc math (angles in standard math notation):
 *   North stand: -150° to -30°  (top arc of ring)
 *   South stand:  30° to 150°   (bottom arc of ring)
 *   East stand:  -30° to  30°   (right arc of ring)
 *   West stand:  150° to 210°   (left arc of ring)
 *
 * Computed keypoints on outer ellipse (rx=310, ry=243):
 *   at -150°: (132, 186)    at -30°: (668, 186)
 *   at   30°: (668, 430)    at 150°: (132, 430)
 *   at    0°: (710, 308)    at 180°: (90,  308)
 *
 * Computed keypoints on inner ellipse (rx=242, ry=186):
 *   at -150°: (190, 215)    at -30°: (610, 215)
 *   at   30°: (610, 401)    at 150°: (190, 401)
 *   at    0°: (642, 308)    at 180°: (158, 308)
 */

import { StadiumZoneConfig } from '@/types/digitalTwin';

// ─── Seating Zones ────────────────────────────────────────────────────────────

const NORTH_STAND: StadiumZoneConfig = {
  id: 'north-stand',
  name: 'North Stand',
  shortName: 'North',
  type: 'seating',
  capacity: 22800,
  // Outer arc (-150° → -30°) + inner arc (reversed, -30° → -150°)
  svgPath: 'M 132,186 A 310,243 0 0 1 668,186 L 610,215 A 242,186 0 0 0 190,215 Z',
  labelPosition: { x: 400, y: 162 },
  focusPoint: { x: 400, y: 186, zoom: 2.2 },
  linkedIncidentCategories: ['crowd', 'security', 'medical', 'accessibility'],
  defaultColor: '#e8f0ea',
  description: 'Primary seating behind the north goal. Capacity: 22,800. All entry via Gate A and Gate F.',
};

const SOUTH_STAND: StadiumZoneConfig = {
  id: 'south-stand',
  name: 'South Stand',
  shortName: 'South',
  type: 'seating',
  capacity: 22800,
  svgPath: 'M 668,430 A 310,243 0 0 1 132,430 L 190,401 A 242,186 0 0 0 610,401 Z',
  labelPosition: { x: 400, y: 456 },
  focusPoint: { x: 400, y: 430, zoom: 2.2 },
  linkedIncidentCategories: ['crowd', 'security', 'medical', 'accessibility'],
  defaultColor: '#e8f0ea',
  description: 'Primary seating behind the south goal. Capacity: 22,800. Primary access via Gate D and Gate E.',
};

const EAST_STAND: StadiumZoneConfig = {
  id: 'east-stand',
  name: 'East Stand',
  shortName: 'East',
  type: 'seating',
  capacity: 18600,
  svgPath: 'M 668,186 A 310,243 0 0 1 668,430 L 610,401 A 242,186 0 0 0 610,215 Z',
  labelPosition: { x: 695, y: 308 },
  focusPoint: { x: 668, y: 308, zoom: 2.4 },
  linkedIncidentCategories: ['crowd', 'security', 'medical', 'volunteer'],
  defaultColor: '#e8f0ea',
  description: 'East touchline seating. Capacity: 18,600. General admission entry via Gates B and C.',
};

const WEST_STAND: StadiumZoneConfig = {
  id: 'west-stand',
  name: 'West Stand',
  shortName: 'West',
  type: 'seating',
  capacity: 18600,
  svgPath: 'M 132,430 A 310,243 0 0 1 132,186 L 190,215 A 242,186 0 0 0 190,401 Z',
  labelPosition: { x: 105, y: 308 },
  focusPoint: { x: 132, y: 308, zoom: 2.4 },
  linkedIncidentCategories: ['crowd', 'security', 'medical', 'volunteer'],
  defaultColor: '#e8f0ea',
  description: 'West touchline seating. Capacity: 18,600. General admission entry via Gate F and Gate E.',
};

// ─── Premium Zones ────────────────────────────────────────────────────────────

const VIP: StadiumZoneConfig = {
  id: 'vip',
  name: 'VIP Suite',
  shortName: 'VIP',
  type: 'premium',
  capacity: 1800,
  // Upper portion of East Stand ring (angles -30° to 0°)
  svgPath: 'M 668,186 A 310,243 0 0 1 710,308 L 642,308 A 242,186 0 0 0 610,215 Z',
  labelPosition: { x: 673, y: 248 },
  focusPoint: { x: 680, y: 248, zoom: 3.0 },
  linkedIncidentCategories: ['security', 'medical', 'accessibility', 'volunteer'],
  defaultColor: '#fdf4dc',
  description: 'VIP executive suites. Capacity: 1,800. Requires dedicated security escort. Access via dedicated VIP Gate C.',
};

const HOSPITALITY: StadiumZoneConfig = {
  id: 'hospitality',
  name: 'Hospitality',
  shortName: 'Hosp.',
  type: 'premium',
  capacity: 2400,
  // Lower portion of East Stand ring (angles 0° to 30°)
  svgPath: 'M 710,308 A 310,243 0 0 1 668,430 L 610,401 A 242,186 0 0 0 642,308 Z',
  labelPosition: { x: 673, y: 370 },
  focusPoint: { x: 680, y: 370, zoom: 3.0 },
  linkedIncidentCategories: ['security', 'medical', 'volunteer'],
  defaultColor: '#fdf4dc',
  description: 'Corporate hospitality boxes. Capacity: 2,400. Premium food and beverage service. Access via Gate C.',
};

const MEDIA: StadiumZoneConfig = {
  id: 'media',
  name: 'Media Centre',
  shortName: 'Media',
  type: 'premium',
  capacity: 600,
  // Upper portion of West Stand ring (angles 180° to 150°)
  svgPath: 'M 90,308 A 310,243 0 0 1 132,186 L 190,215 A 242,186 0 0 0 158,308 Z',
  labelPosition: { x: 117, y: 248 },
  focusPoint: { x: 110, y: 248, zoom: 3.0 },
  linkedIncidentCategories: ['infrastructure', 'security', 'volunteer'],
  defaultColor: '#e8ecf5',
  description: 'FIFA media tribune and press box. Capacity: 600. Controlled-access credential zone. Monitored by CCTV Hub.',
};

// ─── Operations Zones ─────────────────────────────────────────────────────────

const COMMAND_CENTER: StadiumZoneConfig = {
  id: 'command-center',
  name: 'Command Center',
  shortName: 'CMD',
  type: 'operations',
  capacity: 50,
  svgPath: 'M 87,192 L 147,192 L 147,228 L 87,228 Z',
  labelPosition: { x: 117, y: 210 },
  focusPoint: { x: 117, y: 210, zoom: 3.5 },
  linkedIncidentCategories: ['security', 'infrastructure', 'crowd', 'weather'],
  defaultColor: '#0f5132',
  description: 'Operational Command Center. Primary coordination hub for all FIFA tournament operations. Houses all senior decision-makers.',
};

const SECURITY_HQ: StadiumZoneConfig = {
  id: 'security-hq',
  name: 'Security HQ',
  shortName: 'SEC',
  type: 'operations',
  capacity: 80,
  svgPath: 'M 653,192 L 713,192 L 713,228 L 653,228 Z',
  labelPosition: { x: 683, y: 210 },
  focusPoint: { x: 683, y: 210, zoom: 3.5 },
  linkedIncidentCategories: ['security', 'crowd', 'accessibility'],
  defaultColor: '#1e40af',
  description: 'Security Operations HQ. Coordinates all security personnel, CCTV monitoring, and perimeter control.',
};

const MEDICAL_HQ: StadiumZoneConfig = {
  id: 'medical-hq',
  name: 'Medical HQ',
  shortName: 'MED',
  type: 'operations',
  capacity: 40,
  svgPath: 'M 653,388 L 713,388 L 713,424 L 653,424 Z',
  labelPosition: { x: 683, y: 406 },
  focusPoint: { x: 683, y: 406, zoom: 3.5 },
  linkedIncidentCategories: ['medical', 'accessibility'],
  defaultColor: '#dc2626',
  description: 'Medical Operations HQ. Manages all medical teams, first aid posts, and emergency medical response coordination.',
};

const VOLUNTEER_HQ: StadiumZoneConfig = {
  id: 'volunteer-hq',
  name: 'Volunteer HQ',
  shortName: 'VOL',
  type: 'operations',
  capacity: 200,
  svgPath: 'M 87,388 L 147,388 L 147,424 L 87,424 Z',
  labelPosition: { x: 117, y: 406 },
  focusPoint: { x: 117, y: 406, zoom: 3.5 },
  linkedIncidentCategories: ['volunteer', 'crowd', 'accessibility'],
  defaultColor: '#7c3aed',
  description: 'Volunteer Coordination HQ. Deploys 1,200+ tournament volunteers across all stadium zones.',
};

// ─── Gate Zones ───────────────────────────────────────────────────────────────

const GATE_A: StadiumZoneConfig = {
  id: 'gate-a',
  name: 'Gate A — North',
  shortName: 'Gate A',
  type: 'gate',
  capacity: 4000,
  svgPath: 'M 383,52 L 417,52 L 417,72 L 383,72 Z',
  labelPosition: { x: 400, y: 44 },
  focusPoint: { x: 400, y: 62, zoom: 3.2 },
  linkedIncidentCategories: ['crowd', 'security', 'accessibility'],
  defaultColor: '#6b7280',
  description: 'North primary entry gate. Turnstile capacity: 4,000 spectators/hour. North Stand primary access.',
};

const GATE_B: StadiumZoneConfig = {
  id: 'gate-b',
  name: 'Gate B — NE',
  shortName: 'Gate B',
  type: 'gate',
  capacity: 3500,
  svgPath: 'M 607,108 L 625,108 L 625,132 L 607,132 Z',
  labelPosition: { x: 635, y: 118 },
  focusPoint: { x: 616, y: 120, zoom: 3.2 },
  linkedIncidentCategories: ['crowd', 'security'],
  defaultColor: '#6b7280',
  description: 'Northeast entry gate. Turnstile capacity: 3,500 spectators/hour. East Stand upper section access.',
};

const GATE_C: StadiumZoneConfig = {
  id: 'gate-c',
  name: 'Gate C — SE',
  shortName: 'Gate C',
  type: 'gate',
  capacity: 3500,
  svgPath: 'M 607,488 L 625,488 L 625,512 L 607,512 Z',
  labelPosition: { x: 635, y: 502 },
  focusPoint: { x: 616, y: 500, zoom: 3.2 },
  linkedIncidentCategories: ['crowd', 'security', 'volunteer'],
  defaultColor: '#6b7280',
  description: 'Southeast entry gate. Turnstile capacity: 3,500 spectators/hour. VIP and Hospitality primary access.',
};

const GATE_D: StadiumZoneConfig = {
  id: 'gate-d',
  name: 'Gate D — South',
  shortName: 'Gate D',
  type: 'gate',
  capacity: 4000,
  svgPath: 'M 383,548 L 417,548 L 417,568 L 383,568 Z',
  labelPosition: { x: 400, y: 576 },
  focusPoint: { x: 400, y: 558, zoom: 3.2 },
  linkedIncidentCategories: ['crowd', 'security', 'accessibility'],
  defaultColor: '#6b7280',
  description: 'South primary entry gate. Turnstile capacity: 4,000 spectators/hour. South Stand primary access.',
};

const GATE_E: StadiumZoneConfig = {
  id: 'gate-e',
  name: 'Gate E — SW',
  shortName: 'Gate E',
  type: 'gate',
  capacity: 3500,
  svgPath: 'M 175,488 L 193,488 L 193,512 L 175,512 Z',
  labelPosition: { x: 165, y: 502 },
  focusPoint: { x: 184, y: 500, zoom: 3.2 },
  linkedIncidentCategories: ['crowd', 'security', 'accessibility'],
  defaultColor: '#6b7280',
  description: 'Southwest entry gate. Turnstile capacity: 3,500 spectators/hour. West Stand lower section access.',
};

const GATE_F: StadiumZoneConfig = {
  id: 'gate-f',
  name: 'Gate F — NW',
  shortName: 'Gate F',
  type: 'gate',
  capacity: 3500,
  svgPath: 'M 175,108 L 193,108 L 193,132 L 175,132 Z',
  labelPosition: { x: 165, y: 118 },
  focusPoint: { x: 184, y: 120, zoom: 3.2 },
  linkedIncidentCategories: ['crowd', 'security'],
  defaultColor: '#6b7280',
  description: 'Northwest entry gate. Turnstile capacity: 3,500 spectators/hour. West Stand upper section and Media access.',
};

// ─── External / Transport Zones ───────────────────────────────────────────────

const BUS_HUB: StadiumZoneConfig = {
  id: 'bus-hub',
  name: 'Bus Hub',
  shortName: 'Bus',
  type: 'external',
  capacity: 5000,
  svgPath: 'M 360,8 L 440,8 L 440,34 L 360,34 Z',
  labelPosition: { x: 400, y: 21 },
  focusPoint: { x: 400, y: 21, zoom: 2.8 },
  linkedIncidentCategories: ['transport', 'crowd'],
  defaultColor: '#3b82f6',
  description: 'Northern Bus Hub. Serves 28 shuttle routes from city hotels and fan zones. Peak capacity: 5,000 pax/hr.',
};

const METRO: StadiumZoneConfig = {
  id: 'metro',
  name: 'Metro Station',
  shortName: 'Metro',
  type: 'external',
  capacity: 8000,
  svgPath: 'M 770,285 L 798,285 L 798,331 L 770,331 Z',
  labelPosition: { x: 784, y: 308 },
  focusPoint: { x: 784, y: 308, zoom: 2.8 },
  linkedIncidentCategories: ['transport', 'crowd'],
  defaultColor: '#3b82f6',
  description: 'Metro East Station. Dual-platform underground station. Capacity: 8,000 passengers/hour. Direct to city centre.',
};

const TAXI: StadiumZoneConfig = {
  id: 'taxi',
  name: 'Taxi & Ride Share',
  shortName: 'Taxi',
  type: 'external',
  capacity: 2000,
  svgPath: 'M 360,590 L 440,590 L 440,616 L 360,616 Z',
  labelPosition: { x: 400, y: 603 },
  focusPoint: { x: 400, y: 603, zoom: 2.8 },
  linkedIncidentCategories: ['transport', 'crowd'],
  defaultColor: '#f59e0b',
  description: 'Southern Taxi and Ride Share zone. Managed drop-off/pick-up. Capacity: 400 vehicles simultaneous.',
};

const PARKING_A: StadiumZoneConfig = {
  id: 'parking-a',
  name: 'Parking NE',
  shortName: 'P-NE',
  type: 'external',
  capacity: 3200,
  svgPath: 'M 706,65 L 778,65 L 778,115 L 706,115 Z',
  labelPosition: { x: 742, y: 90 },
  focusPoint: { x: 742, y: 90, zoom: 2.5 },
  linkedIncidentCategories: ['transport', 'crowd', 'security'],
  defaultColor: '#9ca3af',
  description: 'Northeast Parking Zone A. Accredited vehicles and sponsor parking. 3,200 spaces. Security patrolled.',
};

const PARKING_B: StadiumZoneConfig = {
  id: 'parking-b',
  name: 'Parking NW',
  shortName: 'P-NW',
  type: 'external',
  capacity: 3200,
  svgPath: 'M 22,65 L 94,65 L 94,115 L 22,115 Z',
  labelPosition: { x: 58, y: 90 },
  focusPoint: { x: 58, y: 90, zoom: 2.5 },
  linkedIncidentCategories: ['transport', 'crowd', 'security'],
  defaultColor: '#9ca3af',
  description: 'Northwest Parking Zone B. Emergency vehicle priority lanes. 3,200 spaces. Includes accessible parking.',
};

// ─── Infrastructure Zones ─────────────────────────────────────────────────────

const CCTV_HUB: StadiumZoneConfig = {
  id: 'cctv-hub',
  name: 'CCTV Hub',
  shortName: 'CCTV',
  type: 'infrastructure',
  capacity: 20,
  svgPath: 'M 372,108 L 428,108 L 428,130 L 372,130 Z',
  labelPosition: { x: 400, y: 119 },
  focusPoint: { x: 400, y: 119, zoom: 4.0 },
  linkedIncidentCategories: ['security', 'infrastructure'],
  defaultColor: '#374151',
  description: 'Central CCTV Operations. Monitors 248 camera feeds across all zones. Integrated with AI analytics.',
};

// ─── All Zones Export ─────────────────────────────────────────────────────────

export const STADIUM_ZONES: StadiumZoneConfig[] = [
  // Seating
  NORTH_STAND,
  SOUTH_STAND,
  EAST_STAND,
  WEST_STAND,
  // Premium
  VIP,
  HOSPITALITY,
  MEDIA,
  // Operations
  COMMAND_CENTER,
  SECURITY_HQ,
  MEDICAL_HQ,
  VOLUNTEER_HQ,
  // Gates
  GATE_A,
  GATE_B,
  GATE_C,
  GATE_D,
  GATE_E,
  GATE_F,
  // External / Transport
  BUS_HUB,
  METRO,
  TAXI,
  PARKING_A,
  PARKING_B,
  // Infrastructure
  CCTV_HUB,
];

/** Look up a zone config by its ID */
export function getZoneById(id: string): StadiumZoneConfig | undefined {
  return STADIUM_ZONES.find((z) => z.id === id);
}

// ─── Route Origins ────────────────────────────────────────────────────────────

import type { RouteType } from '@/types/digitalTwin';

/** SVG origin points for each operational route type (dispatch source) */
export const ROUTE_ORIGINS: Record<RouteType, { x: number; y: number }> = {
  medical: { x: 683, y: 406 },    // Medical HQ
  security: { x: 683, y: 210 },   // Security HQ
  volunteer: { x: 117, y: 406 },  // Volunteer HQ
  vip: { x: 683, y: 210 },        // Security escorts from Security HQ
  transport: { x: 400, y: 21 },   // Bus Hub
  evacuation: { x: 400, y: 558 }, // South Gate D (evacuation primary)
};
