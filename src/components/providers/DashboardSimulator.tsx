'use client';

import { useEffect } from 'react';
import { useIncident } from '@/hooks/useIncident';

export function DashboardSimulator() {
  const { fluctuateStats, addActivity } = useIncident();

  useEffect(() => {
    // Stats fluctuation loop (runs every 8 seconds)
    const statsInterval = setInterval(() => {
      fluctuateStats();
    }, 8000);

    // Automated background systems log loop (runs every 25 seconds)
    const logInterval = setInterval(() => {
      const mockLogs = [
        "SCADA System: CCTV feed C3 connection verified",
        "Facilities: Cleaning crew dispatched to Concourse F",
        "Security AI: Sector A outer perimeter density normalized",
        "Transport: Shuttle route A frequency increased by 5%",
        "Volunteer Network: Vol-8 reported first aid supply restocked at Post 4",
        "Telemetry: Gate 3 ticketing offline terminals power cycled successfully",
        "Weather radar: Approaching cell speed decreased by 5km/h",
      ];
      
      const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
      addActivity(randomLog, "System Telemetry");
    }, 25000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(logInterval);
    };
  }, [fluctuateStats, addActivity]);

  return null;
}
