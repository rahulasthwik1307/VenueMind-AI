export type UserPersona = 'fan' | 'volunteer' | 'operations';

export interface PersonaMetadata {
  id: UserPersona;
  name: string;
  description: string;
  allowedFeatures: string[];
}
