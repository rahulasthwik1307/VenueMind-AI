'use client';

import { useEffect } from 'react';
import { simulationService } from '@/services/simulation.service';

export function DashboardSimulator() {
  useEffect(() => {
    // Reset and start the simulation scheduler on component mount
    simulationService.reset();
    simulationService.start();

    // Stop the simulation scheduler on component unmount
    return () => {
      simulationService.stop();
    };
  }, []);

  return null;
}
