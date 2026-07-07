import { usePersonaStore } from '../store/modules/persona';

export function usePersona() {
  const currentPersona = usePersonaStore((state) => state.currentPersona);
  const setPersona = usePersonaStore((state) => state.setPersona);

  return {
    currentPersona,
    setPersona,
  };
}
