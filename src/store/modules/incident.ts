import { create } from 'zustand';
import { Incident, IncidentAnalysis, Toast, ActivityItem } from '@/types/incident';
import { Severity } from '@/types/common';

export interface IncidentState {
  incidents: Incident[];
  analyses: Record<string, IncidentAnalysis>;
  activeIncidentId: string | null;
  filter: 'all' | 'critical' | 'open' | 'investigating' | 'resolved';
  searchQuery: string;
  activities: ActivityItem[];
  toasts: Toast[];
  stadiumStats: {
    crowdDensity: number;
    aiConfidence: number;
    transportStatus: string;
    medicalStandby: number;
  };
  setIncidents: (incidents: Incident[]) => void;
  setActiveIncidentId: (id: string | null) => void;
  setFilter: (filter: 'all' | 'critical' | 'open' | 'investigating' | 'resolved') => void;
  setSearchQuery: (query: string) => void;
  dispatchAction: (incidentId: string, recommendationId: string) => void;
  markIncidentResolved: (incidentId: string) => void;
  updateIncidentNotes: (incidentId: string, notes: string) => void;
  dismissRecommendation: (incidentId: string, recommendationId: string) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  addActivity: (message: string, actor: string, severity?: Severity) => void;
  fluctuateStats: () => void;
}

// Generate base dates relative to current time to keep mock timestamps feeling "live"
const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    title: 'Crowd congestion at Gate 7',
    description: 'Heavy bottleneck forming at Gate 7 outer ticket scanning barriers. Ticket scanning flow rate has dropped to 12 persons/min due to scanning terminal communication errors. Large group of spectators piling up at the outer security ring.',
    status: 'open',
    severity: 'high',
    category: 'crowd',
    location: { lat: 25.4522, lng: 51.3414, zone: 'North Stand · Gate 7' },
    reporterId: 'sys-sensor-04',
    createdAt: minutesAgo(2),
    updatedAt: minutesAgo(2),
    assignedTeam: 'Security Team A & Volunteers',
    aiConfidence: 94,
    timeline: [
      {
        id: 'evt-1',
        title: 'Anomalous Accumulation Detected',
        description: 'CCTV feed cameras C7-North show high density (>4 people/sqm) near Gate 7 entrance plaza.',
        timestamp: minutesAgo(4),
        type: 'detection',
      },
      {
        id: 'evt-2',
        title: 'AI Analysis Complete',
        description: 'AI model correlates dense crowd flow with high ticket scanning failure rates at Gate 7 terminals.',
        timestamp: minutesAgo(3),
        type: 'ai_analysis',
      },
    ],
  },
  {
    id: 'inc-002',
    title: 'Medical assistance requested (Heat exhaustion)',
    description: 'A spectator in Sector C, Row 14, seat 12 reports severe dizziness, nausea, and signs of extreme dehydration. Seated density is high, with ambient temperature around 28°C.',
    status: 'investigating',
    severity: 'medium',
    category: 'medical',
    location: { lat: 25.4518, lng: 51.3421, zone: 'Sector C · Row 14' },
    reporterId: 'spectator-app-109',
    createdAt: minutesAgo(8),
    updatedAt: minutesAgo(6),
    assignedTeam: 'Medical Unit 3',
    aiConfidence: 87,
    timeline: [
      {
        id: 'evt-3',
        title: 'Mobile App SOS Triggered',
        description: 'Spectator submitted a medical alert requesting immediate support via local tournament companion application.',
        timestamp: minutesAgo(8),
        type: 'detection',
      },
      {
        id: 'evt-4',
        title: 'Medical Unit 3 Alerted',
        description: 'Operations Center dispatched request to nearby Medical Unit 3 on standby at Station East.',
        timestamp: minutesAgo(7),
        type: 'medical',
      },
      {
        id: 'evt-5',
        title: 'Unit Dispatched',
        description: 'Medical Team 3 confirmed dispatch and is en route with a heat exhaustion response kit.',
        timestamp: minutesAgo(6),
        type: 'operator_action',
      },
    ],
  },
  {
    id: 'inc-003',
    title: 'Lost child reported at Fan Services',
    description: 'A 6-year-old child (Brazil jersey, name tag "Lucas") was reported separated from family near the East Food Plaza. Family is currently waiting at the Fan Services Desk East.',
    status: 'resolved',
    severity: 'medium',
    category: 'volunteer',
    location: { lat: 25.4531, lng: 51.3435, zone: 'Fan Services Desk · East' },
    reporterId: 'ops-desk-02',
    createdAt: minutesAgo(25),
    updatedAt: minutesAgo(5),
    assignedTeam: 'Volunteer Team B',
    aiConfidence: 76,
    timeline: [
      {
        id: 'evt-6',
        title: 'Lost Child Logged',
        description: 'Parent reported separation to Desk East coordinator.',
        timestamp: minutesAgo(25),
        type: 'detection',
      },
      {
        id: 'evt-7',
        title: 'Volunteer Network Alerted',
        description: 'Description broadcasted to all concourse volunteer radio feeds.',
        timestamp: minutesAgo(23),
        type: 'volunteer',
      },
      {
        id: 'evt-8',
        title: 'Child Located',
        description: 'Volunteer at Sector D Concourse spotted child matching description.',
        timestamp: minutesAgo(10),
        type: 'system',
      },
      {
        id: 'evt-9',
        title: 'Reunion Confirmed',
        description: 'Child safely returned to parents at Fan Services Desk East. Incident closed.',
        timestamp: minutesAgo(5),
        type: 'resolution',
      },
    ],
  },
  {
    id: 'inc-004',
    title: 'Major water spill at Concourse G entrance',
    description: 'A spectator reported a large puddle of liquid, possibly water from a faulty HVAC condensation line, creating a slippery surface near the main ramp of Concourse G.',
    status: 'open',
    severity: 'low',
    category: 'infrastructure',
    location: { lat: 25.4545, lng: 51.3402, zone: 'Concourse B · Sector G Entrance' },
    reporterId: 'sys-sensor-09',
    createdAt: minutesAgo(12),
    updatedAt: minutesAgo(12),
    assignedTeam: 'Facilities Crew 2',
    aiConfidence: 92,
    timeline: [
      {
        id: 'evt-10',
        title: 'Spill Reported',
        description: 'Report filed by cleaning supervisor during regular corridor sweeps.',
        timestamp: minutesAgo(12),
        type: 'detection',
      },
      {
        id: 'evt-11',
        title: 'AI Priority Evaluation',
        description: 'AI analyzed traffic density at ramp G and determined a high slip risk for elderly or disabled attendees.',
        timestamp: minutesAgo(11),
        type: 'ai_analysis',
      },
    ],
  },
  {
    id: 'inc-005',
    title: 'Turnstile scanner connectivity failures',
    description: 'Three scanning terminals at Gate 3 South Entrance are experiencing periodic network dropouts, causing them to reject valid RFID ticketing cards and delay entry.',
    status: 'investigating',
    severity: 'high',
    category: 'infrastructure',
    location: { lat: 25.4501, lng: 51.3411, zone: 'South Turnstiles · Gate 3' },
    reporterId: 'sys-network-check',
    createdAt: minutesAgo(15),
    updatedAt: minutesAgo(10),
    assignedTeam: 'IT Support Team',
    aiConfidence: 89,
    timeline: [
      {
        id: 'evt-12',
        title: 'Network Packet Drop Alert',
        description: 'Automated network monitoring system detected >15% packet loss on switch port 14.',
        timestamp: minutesAgo(15),
        type: 'detection',
      },
      {
        id: 'evt-13',
        title: 'IT Helpdesk Logged',
        description: 'Network engineering team alerted to inspect the physical fiber patch at South Rack B.',
        timestamp: minutesAgo(13),
        type: 'system',
      },
      {
        id: 'evt-14',
        title: 'Technician Dispatched',
        description: 'On-site IT Support technician confirmed dispatch to inspect switch 14.',
        timestamp: minutesAgo(10),
        type: 'operator_action',
      },
    ],
  },
  {
    id: 'inc-006',
    title: 'Shuttle bus fleet B delay',
    description: 'Shuttle Bus Route B (Metro Station to East Gate) is experiencing a 15-minute average delay due to an external traffic bottleneck at the Al Khor intersection.',
    status: 'open',
    severity: 'low',
    category: 'transport',
    location: { lat: 25.4565, lng: 51.3465, zone: 'External Shuttle Hub B' },
    reporterId: 'gps-fleet-tracker',
    createdAt: minutesAgo(18),
    updatedAt: minutesAgo(18),
    assignedTeam: 'Transport Coordinator',
    aiConfidence: 81,
    timeline: [
      {
        id: 'evt-15',
        title: 'GPS Tracking Alert',
        description: 'Route B vehicles show average travel times exceeding historical baseline by 35%.',
        timestamp: minutesAgo(18),
        type: 'detection',
      },
    ],
  },
  {
    id: 'inc-007',
    title: 'Heavy rain pre-alert and lightning risk',
    description: 'National weather service reports a convective weather cell moving towards the stadium, carrying a high probability of heavy precipitation and localized lightning within the next 45 minutes.',
    status: 'open',
    severity: 'medium',
    category: 'weather',
    location: { lat: 25.4528, lng: 51.3428, zone: 'Stadium Wide' },
    reporterId: 'weather-api',
    createdAt: minutesAgo(30),
    updatedAt: minutesAgo(30),
    assignedTeam: 'Ops Command Center',
    aiConfidence: 95,
    timeline: [
      {
        id: 'evt-16',
        title: 'Radar Ingest Alert',
        description: 'Radar feeds show precipitation cells approaching from West with gusty winds.',
        timestamp: minutesAgo(30),
        type: 'detection',
      },
    ],
  },
  {
    id: 'inc-008',
    title: 'Power fluctuation at Level 4 Press Box',
    description: 'A transient voltage sag was recorded in Sector 4 Press Box electrical distribution board. Broadcast networks experienced minor screen flicker, but backup UPS handled the load.',
    status: 'resolved',
    severity: 'medium',
    category: 'infrastructure',
    location: { lat: 25.4539, lng: 51.3418, zone: 'Level 4 · Press Box East' },
    reporterId: 'ups-monitor-l4',
    createdAt: minutesAgo(45),
    updatedAt: minutesAgo(20),
    assignedTeam: 'Electrical Response Team',
    aiConfidence: 84,
    timeline: [
      {
        id: 'evt-17',
        title: 'Voltage Sag Detected',
        description: 'Power monitoring meters recorded a drop of 15% voltage lasting 80ms.',
        timestamp: minutesAgo(45),
        type: 'detection',
      },
      {
        id: 'evt-18',
        title: 'Electrician On-Site',
        description: 'Technical dispatch team sent to inspect ATS (Automatic Transfer Switch) operation.',
        timestamp: minutesAgo(35),
        type: 'system',
      },
      {
        id: 'evt-19',
        title: 'Switch Integrity Verified',
        description: 'Electrician confirmed ATS switched properly. Main utility feed recovered. Issue resolved.',
        timestamp: minutesAgo(20),
        type: 'resolution',
      },
    ],
  },
  {
    id: 'inc-009',
    title: 'Unattended bag at Gate 3 outer zone',
    description: 'An unattended black backpack was reported sitting near the concrete planters outside the secondary security checkpoint at Gate 3. No owner is in the immediate vicinity.',
    status: 'open',
    severity: 'critical',
    category: 'security',
    location: { lat: 25.4495, lng: 51.3405, zone: 'Outer Security Gate 3' },
    reporterId: 'cctv-object-detection',
    createdAt: minutesAgo(5),
    updatedAt: minutesAgo(5),
    assignedTeam: 'Security Quick Response Team',
    aiConfidence: 96,
    timeline: [
      {
        id: 'evt-20',
        title: 'Unattended Object Flagged',
        description: 'AI object detection on CCTV camera Outer-3-B flagged a backpack stationary for >10 minutes.',
        timestamp: minutesAgo(5),
        type: 'detection',
      },
      {
        id: 'evt-21',
        title: 'AI Threat Analysis',
        description: 'System classified object as high risk based on location, crowd proximity, and duration.',
        timestamp: minutesAgo(4),
        type: 'ai_analysis',
      },
    ],
  },
  {
    id: 'inc-010',
    title: 'Elevator mechanical fault at VIP West',
    description: 'Accessibility Elevator #3 at the West VIP suite entrance is reported stuck between Suite Level 1 and 2. Maintenance indicators report a door interlock error.',
    status: 'investigating',
    severity: 'high',
    category: 'infrastructure',
    location: { lat: 25.4520, lng: 51.3401, zone: 'West Elevator · Suite Level Access' },
    reporterId: 'elevator-telemetry',
    createdAt: minutesAgo(10),
    updatedAt: minutesAgo(8),
    assignedTeam: 'Accessibility Staff & Elevator Tech',
    aiConfidence: 90,
    timeline: [
      {
        id: 'evt-22',
        title: 'Elevator Fault Code Logged',
        description: 'SCADA panel flagged door-lock safety failure code E-402 on Elevator #3.',
        timestamp: minutesAgo(10),
        type: 'detection',
      },
      {
        id: 'evt-23',
        title: 'Tech Alert Dispatched',
        description: 'Elevator maintenance contractor paged and dispatched to West shaft.',
        timestamp: minutesAgo(8),
        type: 'operator_action',
      },
    ],
  },
];

const MOCK_ANALYSES: Record<string, IncidentAnalysis> = {
  'inc-001': {
    incidentId: 'inc-001',
    aiSituationSummary: {
      explanation: 'Ticket scanning failure rates at Gate 7 are causing crowd inflow to drop to 12 persons per minute. The upcoming kickoff (in 45 minutes) is leading to spectator accumulation on the outer perimeter, raising safety concerns.',
      expectedRisks: 'Severe crowd crush risk at scanning barriers; delayed entry causing spectator frustration; potential security breach at perimeter gates.',
      recommendedResponse: 'Immediately open alternative Gate 9 corridor, dispatch crowd-flow volunteers to guide crowd redirection, and broadcast localized alert feeds.'
    },
    nearbyFacilities: [
      { name: 'Gate 9 North Corridor', distance: '120m away', type: 'gate' },
      { name: 'Medical Bay A1', distance: '80m away', type: 'medical' },
      { name: 'Volunteer Hub North', distance: '50m away', type: 'staff' },
    ],
    estimatedImpact: 'High risk of perimeter bottleneck. Direct impact: 1,200 spectators delayed.',
    recommendations: [
      {
        id: 'rec-1-1',
        title: 'Redirect Crowd to Gate 9',
        explanation: 'Opening the auxiliary corridors at Gate 9 can absorb up to 40% of the North Stand inflow, easing Gate 7 density.',
        action: 'Divert flow to Gate 9 north corridor and deploy volunteers to guide them',
        confidence: 94,
        expectedImpact: 'Reduces queue at Gate 7 by 450+ people in 6 minutes.',
        eta: '3 mins',
        priority: 'high',
        executed: false,
      },
      {
        id: 'rec-1-2',
        title: 'Broadcast Crowd Alert',
        explanation: 'Broadcast a targeted alert to mobile app users in the North Stand region and display redirection instructions on plaza screens.',
        action: 'Publish digital signage alert for North Stand plaza screens',
        confidence: 89,
        expectedImpact: 'Diverts incoming flow prior to reaching crowded outer gates.',
        eta: '1 min',
        priority: 'high',
        executed: false,
      },
      {
        id: 'rec-1-3',
        title: 'Deploy Concourse Volunteers',
        explanation: 'Reposition volunteers from nearby North Stand concourses to guide spectators toward Gate 9.',
        action: 'Dispatch 6 volunteers to Gate 7 outer plaza',
        confidence: 85,
        expectedImpact: 'Provides visual guidance and maintains crowd order.',
        eta: '5 mins',
        priority: 'medium',
        executed: false,
      },
    ],
  },
  'inc-002': {
    incidentId: 'inc-002',
    aiSituationSummary: {
      explanation: 'A spectator in Sector C Row 14 is suffering from heat exhaustion. High density and 28°C temperatures exacerbate this. Medical Team 3 is en route but density slows walking speed.',
      expectedRisks: 'Patient condition degradation; localized corridor blockage; secondary heat exhaustion cases due to local conditions.',
      recommendedResponse: 'Ensure Medical Unit 3 has clear access; deploy volunteer teams with water/ice packs to the sector to prevent secondary incidents.'
    },
    nearbyFacilities: [
      { name: 'First Aid Station C2', distance: '45m away', type: 'medical' },
      { name: 'Cooling Station East', distance: '110m away', type: 'general' },
    ],
    estimatedImpact: 'Minor localized sector disturbance.',
    recommendations: [
      {
        id: 'rec-2-1',
        title: 'Clear Access for Medical Team',
        explanation: 'Direct Sector C volunteers to clear the access stairs to allow Medical Unit 3 to reach Row 14 without congestion delays.',
        action: 'Instruct Sector C volunteers to clear aisle 14 stairs',
        confidence: 91,
        expectedImpact: 'Ensures medical team reaches patient within 2 minutes.',
        eta: '2 mins',
        priority: 'medium',
        executed: false,
      },
      {
        id: 'rec-2-2',
        title: 'Deploy Hydration Volunteers',
        explanation: 'Deploy concourse volunteers with hydration packs and fans to distribute cold water bottles to adjacent rows in Sector C.',
        action: 'Deploy 2 volunteers with hydration packs to Sector C',
        confidence: 78,
        expectedImpact: 'Lowers risk of heat-related emergencies in adjacent rows.',
        eta: '4 mins',
        priority: 'low',
        executed: false,
      },
    ],
  },
  'inc-004': {
    incidentId: 'inc-004',
    aiSituationSummary: {
      explanation: 'Slippery HVAC condensation water spill at Concourse G entrance ramp. Sector G is a major pedestrian thoroughfare.',
      expectedRisks: 'Spectator slip and fall injuries; bottlenecking on the Concourse ramp.',
      recommendedResponse: 'Dispatch Facilities cleaning crew, lay warning cones, and redirect flow temporarily.'
    },
    nearbyFacilities: [
      { name: 'Facilities Supply Room B', distance: '30m away', type: 'staff' },
      { name: 'Concourse G Security Desk', distance: '70m away', type: 'security' },
    ],
    estimatedImpact: 'Moderate corridor bottleneck during cleaning.',
    recommendations: [
      {
        id: 'rec-4-1',
        title: 'Dispatch Cleaning Crew',
        explanation: 'Send nearby maintenance staff with dry mops and slip hazard signage to clean the water buildup.',
        action: 'Dispatch facilities cleaner with dry mop and cones',
        confidence: 95,
        expectedImpact: 'Dries spill surface completely, removing slip hazard.',
        eta: '3 mins',
        priority: 'medium',
        executed: false,
      },
      {
        id: 'rec-4-2',
        title: 'Deploy Warning Barriers',
        explanation: 'Place temporary caution barriers around the HVAC condensation overflow to redirect flow to the dry side of the ramp.',
        action: 'Instruct nearest concourse volunteers to place yellow warning cones',
        confidence: 88,
        expectedImpact: 'Prevents spectators from walking over the wet zone.',
        eta: '2 mins',
        priority: 'low',
        executed: false,
      },
    ],
  },
  'inc-005': {
    incidentId: 'inc-005',
    aiSituationSummary: {
      explanation: 'Gate 3 Turnstile connectivity sags due to packet drop at Switch 14, delaying access for spectators at the South entrance.',
      expectedRisks: 'Ticketing queues extending past outer perimeter; gate entrance delays; crowd buildup.',
      recommendedResponse: 'Run manual ticketing fallback on handheld devices, bypass network switch if possible, and deploy IT technician.'
    },
    nearbyFacilities: [
      { name: 'IT Office South', distance: '120m away', type: 'staff' },
      { name: 'Security Outpost South', distance: '80m away', type: 'security' },
    ],
    estimatedImpact: 'Gate 3 ingress delay (15 mins). Impact: 600 people.',
    recommendations: [
      {
        id: 'rec-5-1',
        title: 'Initiate Manual Scanner Fallback',
        explanation: 'Equip Gate 3 volunteers with battery-operated handheld validation scanners that use offline databases.',
        action: 'Deploy offline handheld ticketing scanners to Gate 3',
        confidence: 92,
        expectedImpact: 'Bypasses broken turnstiles, recovering 80% flow rate.',
        eta: '4 mins',
        priority: 'high',
        executed: false,
      },
      {
        id: 'rec-5-2',
        title: 'Reboot Network Switch Port',
        explanation: 'Instruct network operations center to execute a port reset commands on Switch 14 port 12 to resolve transient packet loss.',
        action: 'Reset network port 12 via IT admin dashboard',
        confidence: 86,
        expectedImpact: 'Potential fix for network packets drop without hardware swap.',
        eta: '1 min',
        priority: 'medium',
        executed: false,
      },
    ],
  },
  'inc-006': {
    incidentId: 'inc-006',
    aiSituationSummary: {
      explanation: 'Traffic bottleneck at Al Khor intersection delays Shuttle Bus Route B by 15 minutes. Heavy spectator arrival is expected at the Metro Station.',
      expectedRisks: 'Spectator queues at the metro station overspilling; arrival delays.',
      recommendedResponse: 'Divert shuttle buses to alternative Route C and update passenger information displays at the Metro Station.'
    },
    nearbyFacilities: [
      { name: 'Metro Station Bus Loop', distance: '800m away', type: 'transport' },
      { name: 'East Gate Bus Loop', distance: '50m away', type: 'transport' },
    ],
    estimatedImpact: 'Metro ingress delays. Impact: 2,000 spectators.',
    recommendations: [
      {
        id: 'rec-6-1',
        title: 'Activate Route C Alternative',
        explanation: 'Instruct fleet drivers to take the Expressway bypass (Route C) to bypass Al Khor intersection.',
        action: 'Send route update notification to Shuttle B bus drivers',
        confidence: 90,
        expectedImpact: 'Reduces shuttle delay from 15 mins to 5 mins.',
        eta: '5 mins',
        priority: 'medium',
        executed: false,
      },
      {
        id: 'rec-6-2',
        title: 'Update Metro Station Displays',
        explanation: 'Update digital signage at the Metro Shuttle Bus shelter warning passengers of delays and recommending alternative walking routes.',
        action: 'Publish delay notice to Metro Shuttle shelter screen',
        confidence: 82,
        expectedImpact: 'Allows passengers to choose walking (12 mins) instead of waiting.',
        eta: '2 mins',
        priority: 'low',
        executed: false,
      },
    ],
  },
  'inc-007': {
    incidentId: 'inc-007',
    aiSituationSummary: {
      explanation: 'A convective rain storm and lightning cells are moving toward Al Bayt Stadium, expected to strike within 45 minutes.',
      expectedRisks: 'Slippery stairs, wet seats, electric discharge risk in open stands; crowd panic or scramble for shelter.',
      recommendedResponse: 'Broadcast warning, prepare concourse zones for occupancy, and close roof section if applicable.'
    },
    nearbyFacilities: [
      { name: 'Concourse Shelter Zones', distance: '0m away', type: 'general' },
      { name: 'First Aid Station West', distance: '150m away', type: 'medical' },
    ],
    estimatedImpact: 'Stadium-wide impact; potential play disruption.',
    recommendations: [
      {
        id: 'rec-7-1',
        title: 'Deploy Rain Shelter Signage',
        explanation: 'Instruct digital signs across all sections to direct fans to dry concourse zones.',
        action: 'Update all digital screens with shelter guidance',
        confidence: 89,
        expectedImpact: 'Diverts spectators smoothly to indoor concourses.',
        eta: '3 mins',
        priority: 'medium',
        executed: false,
      },
      {
        id: 'rec-7-2',
        title: 'Prepare Wet Weather Gear',
        explanation: 'Equip volunteers at the turnstiles and outer plazas with rain ponchos for distribution.',
        action: 'Deploy rain poncho bins to Gate entrances',
        confidence: 81,
        expectedImpact: 'Improves fan comfort and reduces entrance bottlenecks.',
        eta: '10 mins',
        priority: 'low',
        executed: false,
      },
    ],
  },
  'inc-009': {
    incidentId: 'inc-009',
    aiSituationSummary: {
      explanation: 'An unattended black backpack has been identified outside the Gate 3 security perimeter. CCTV shows it has been sitting there for over 10 minutes with no owner.',
      expectedRisks: 'Threat of explosive device; crowd panic; gate closure requirement.',
      recommendedResponse: 'Dispatch Security QRT, initiate a localized cordoned area, and prepare security notification protocols.'
    },
    nearbyFacilities: [
      { name: 'Security Office South', distance: '90m away', type: 'security' },
      { name: 'Medical Station A1', distance: '140m away', type: 'medical' },
    ],
    estimatedImpact: 'Critical security risk. Possible gate closure.',
    recommendations: [
      {
        id: 'rec-9-1',
        title: 'Dispatch Security QRT',
        explanation: 'Deploy the Security Quick Response Team to evaluate the bag and screen for threats.',
        action: 'Dispatch Security QRT Team 2 to Gate 3 outer planter',
        confidence: 98,
        expectedImpact: 'Immediate on-site investigation by trained explosive detection canine.',
        eta: '2 mins',
        priority: 'critical',
        executed: false,
      },
      {
        id: 'rec-9-2',
        title: 'Establish a 20-Meter Cordon',
        explanation: 'Instruct perimeter security volunteers to quietly divert spectators 20 meters away from the concrete planter.',
        action: 'Establish security cordon around planter area',
        confidence: 93,
        expectedImpact: 'Protects spectators from potential blast fragments.',
        eta: '3 mins',
        priority: 'critical',
        executed: false,
      },
      {
        id: 'rec-9-3',
        title: 'Pre-position Medical Unit',
        explanation: 'Move Medical Unit 1 from Station South to standby near the outer ring perimeter.',
        action: 'Standby Medical Unit 1 at Perimeter Ring 3',
        confidence: 88,
        expectedImpact: 'Ensures immediate emergency response capability.',
        eta: '4 mins',
        priority: 'high',
        executed: false,
      },
    ],
  },
  'inc-010': {
    incidentId: 'inc-010',
    aiSituationSummary: {
      explanation: 'West Elevator #3 is stuck between floors. Contains 4 passengers, including 2 wheelchair users, who require suite access.',
      expectedRisks: 'Entrapment trauma; delay in accessible seating entry; medical risk due to heat in shaft.',
      recommendedResponse: 'Dispatch elevator maintenance tech, deploy accessibility support staff to meet passengers upon rescue.'
    },
    nearbyFacilities: [
      { name: 'Elevator Maintenance Hub', distance: '220m away', type: 'staff' },
      { name: 'VIP Services Desk West', distance: '30m away', type: 'general' },
    ],
    estimatedImpact: 'High impact for accessibility. 4 VIPs stuck.',
    recommendations: [
      {
        id: 'rec-10-1',
        title: 'Dispatch Elevator Technician',
        explanation: 'Page on-duty KONE technician to perform manual brake release and rescue passengers.',
        action: 'Dispatch elevator technician with shaft key',
        confidence: 97,
        expectedImpact: 'Rescues stuck passengers safely within 15 minutes.',
        eta: '5 mins',
        priority: 'high',
        executed: false,
      },
      {
        id: 'rec-10-2',
        title: 'Deploy Accessibility Support Staff',
        explanation: 'Send accessibility coordinators with replacement wheelchairs to VIP Desk West to assist passengers immediately upon evacuation.',
        action: 'Deploy 2 accessibility hosts to VIP West Elevator lobby',
        confidence: 91,
        expectedImpact: 'Minimizes distress and assists passengers immediately to their suites.',
        eta: '3 mins',
        priority: 'high',
        executed: false,
      },
    ],
  },
};

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-001',
    message: 'Security team deployed to Gate 7',
    actor: 'Ops Manager',
    time: minutesAgo(3),
    severity: 'high',
  },
  {
    id: 'act-002',
    message: 'Medical unit 3 responded to sector C',
    actor: 'Medical Lead',
    time: minutesAgo(9),
    severity: 'medium',
  },
  {
    id: 'act-003',
    message: 'Lost child located — reunited with family',
    actor: 'Volunteer Team B',
    time: minutesAgo(20),
    severity: 'low',
  },
  {
    id: 'act-004',
    message: 'Transport Line 2 delay resolved',
    actor: 'Transport Coordinator',
    time: minutesAgo(32),
    severity: 'low',
  },
  {
    id: 'act-005',
    message: 'Sector D gates opened — capacity balanced',
    actor: 'Operations AI',
    time: minutesAgo(45),
  },
];

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: MOCK_INCIDENTS,
  analyses: MOCK_ANALYSES,
  activeIncidentId: null,
  filter: 'all',
  searchQuery: '',
  activities: INITIAL_ACTIVITIES,
  toasts: [],
  stadiumStats: {
    crowdDensity: 72.4,
    aiConfidence: 92,
    transportStatus: 'Good',
    medicalStandby: 8,
  },

  setIncidents: (incidents) => set({ incidents }),
  setActiveIncidentId: (id) => set({ activeIncidentId: id }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  dispatchAction: (incidentId, recommendationId) => set((state) => {
    let actionTitle = 'Action Dispatch';
    let actionDescription = 'Operator dispatched action response.';
    const targetIncident = state.incidents.find(i => i.id === incidentId);
    const severity = targetIncident?.severity;
    
    const updatedIncidents = state.incidents.map((inc) => {
      if (inc.id === incidentId) {
        const now = new Date();
        const analysis = state.analyses[incidentId];
        const rec = analysis?.recommendations.find(r => r.id === recommendationId);
        actionTitle = rec ? rec.title : 'Action Dispatch';
        actionDescription = rec ? rec.action : 'Operator dispatched action response.';
        
        let type: 'security' | 'medical' | 'volunteer' | 'transport' | 'system' | 'operator_action' = 'operator_action';
        if (inc.category === 'security') type = 'security';
        else if (inc.category === 'medical') type = 'medical';
        else if (inc.category === 'volunteer') type = 'volunteer';
        else if (inc.category === 'transport') type = 'transport';
        else if (inc.category === 'infrastructure') type = 'system';

        const newEvent = {
          id: `evt-op-${Date.now()}`,
          title: `Action Dispatched: ${actionTitle}`,
          description: rec ? `Operator initiated action: "${rec.action}"` : 'Operator dispatched action response.',
          timestamp: now.toISOString(),
          type,
        };

        return {
          ...inc,
          status: inc.status === 'open' ? ('investigating' as const) : inc.status,
          timeline: [...inc.timeline, newEvent],
          updatedAt: now.toISOString(),
        };
      }
      return inc;
    });

    const updatedAnalyses = { ...state.analyses };
    if (updatedAnalyses[incidentId]) {
      updatedAnalyses[incidentId] = {
        ...updatedAnalyses[incidentId],
        recommendations: updatedAnalyses[incidentId].recommendations.map((rec) => {
          if (rec.id === recommendationId) {
            return { ...rec, executed: true };
          }
          return rec;
        }),
      };
    }

    const toastId = `toast-${Date.now()}`;
    const newToast: Toast = {
      id: toastId,
      message: `Tactical Action Dispatched: ${actionTitle}`,
      type: 'success',
    };

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      message: `Dispatched: ${actionDescription}`,
      actor: 'Ops Manager',
      time: new Date().toISOString(),
      severity,
    };

    return {
      incidents: updatedIncidents,
      analyses: updatedAnalyses,
      toasts: [...state.toasts, newToast],
      activities: [newActivity, ...state.activities],
    };
  }),

  markIncidentResolved: (incidentId) => set((state) => {
    let incidentTitle = 'Incident';
    let severity = 'low' as Severity;
    
    const updatedIncidents = state.incidents.map((inc) => {
      if (inc.id === incidentId) {
        const now = new Date();
        incidentTitle = inc.title;
        severity = inc.severity;
        const newEvent = {
          id: `evt-res-${Date.now()}`,
          title: 'Incident Resolved',
          description: 'Incident was reviewed and formally marked as resolved by the operator.',
          timestamp: now.toISOString(),
          type: 'resolution' as const,
        };

        return {
          ...inc,
          status: 'resolved' as const,
          timeline: [...inc.timeline, newEvent],
          updatedAt: now.toISOString(),
        };
      }
      return inc;
    });

    const toastId = `toast-${Date.now()}`;
    const newToast: Toast = {
      id: toastId,
      message: `Incident Resolved: ${incidentTitle}`,
      type: 'success',
    };

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      message: `Resolved: ${incidentTitle}`,
      actor: 'Ops Manager',
      time: new Date().toISOString(),
      severity,
    };

    return {
      incidents: updatedIncidents,
      toasts: [...state.toasts, newToast],
      activities: [newActivity, ...state.activities],
    };
  }),

  updateIncidentNotes: (incidentId, notes) => set((state) => {
    const updatedIncidents = state.incidents.map((inc) => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return inc;
    });
    return { incidents: updatedIncidents };
  }),

  dismissRecommendation: (incidentId, recommendationId) => set((state) => {
    const updatedAnalyses = { ...state.analyses };
    if (updatedAnalyses[incidentId]) {
      updatedAnalyses[incidentId] = {
        ...updatedAnalyses[incidentId],
        recommendations: updatedAnalyses[incidentId].recommendations.map((rec) => {
          if (rec.id === recommendationId) {
            return { ...rec, dismissed: true };
          }
          return rec;
        }),
      };
    }
    return { analyses: updatedAnalyses };
  }),

  addToast: (message, type = 'info') => set((state) => {
    const newToast: Toast = {
      id: `toast-${Date.now()}-${Math.random()}`,
      message,
      type,
    };
    return { toasts: [...state.toasts, newToast] };
  }),

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  addActivity: (message, actor, severity) => set((state) => {
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}-${Math.random()}`,
      message,
      actor,
      time: new Date().toISOString(),
      severity,
    };
    return { activities: [newActivity, ...state.activities] };
  }),

  fluctuateStats: () => set((state) => {
    // Random fluctuation between -0.4% and +0.4%
    const crowdDelta = (Math.random() - 0.5) * 0.8;
    const newCrowd = Math.min(99, Math.max(10, parseFloat((state.stadiumStats.crowdDensity + crowdDelta).toFixed(1))));

    // Fluctuate AI confidence slightly
    const confDelta = Math.random() > 0.5 ? 1 : -1;
    const newConf = Math.min(98, Math.max(50, state.stadiumStats.aiConfidence + (Math.random() > 0.8 ? confDelta : 0)));

    // Fluctuating individual active incidents' confidence
    const updatedIncidents = state.incidents.map((inc) => {
      if (inc.status !== 'resolved' && inc.aiConfidence) {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const currentConf = inc.aiConfidence;
        const nextConf = Math.min(99, Math.max(60, currentConf + (Math.random() > 0.75 ? delta : 0)));
        return {
          ...inc,
          aiConfidence: nextConf,
        };
      }
      return inc;
    });

    return {
      stadiumStats: {
        ...state.stadiumStats,
        crowdDensity: newCrowd,
        aiConfidence: newConf,
      },
      incidents: updatedIncidents,
    };
  }),
}));
