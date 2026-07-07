import { Severity } from './common';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  targetPersonas: string[];
  active: boolean;
  createdAt: string;
}
