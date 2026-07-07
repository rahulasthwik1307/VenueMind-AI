export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'mitigated' | 'resolved';
export type SystemStatusLevel = 'operational' | 'degraded' | 'critical' | 'offline';
export type Theme = 'light' | 'dark' | 'system';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperatorInfo {
  name: string;
  role: string;
  avatar?: string;
  status: 'active' | 'away' | 'offline';
}

export interface SystemStatus {
  label: string;
  level: SystemStatusLevel;
  uptime: string;
}

export interface MatchInfo {
  homeTeam: string;
  awayTeam: string;
  venue: string;
  kickoff: string;
  status: 'upcoming' | 'live' | 'halftime' | 'fulltime';
  attendance?: number;
  capacity?: number;
}

export interface WeatherInfo {
  temperature: number;
  unit: 'C' | 'F';
  condition: string;
  humidity: number;
  windSpeed: number;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  severity?: Severity;
}

export interface AlertItem {
  id: string;
  message: string;
  severity: Severity;
  timestamp: string;
  acknowledged: boolean;
}
