export interface StadiumZone {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  securityLevel: string;
}

export interface MapMarker {
  id: string;
  type: 'incident' | 'facility' | 'checkpoint' | 'gate';
  title: string;
  lat: number;
  lng: number;
  metadata?: Record<string, unknown>;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}
