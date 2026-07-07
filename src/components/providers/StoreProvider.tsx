'use client';

import React, { createContext, useContext, useMemo } from 'react';

// Context for the store
const StoreContext = createContext<Record<string, unknown> | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Store context can be used to hold store instances for SSR isolation if required.
  // For now, it is a simple shell wrapper.
  const value = useMemo(() => ({}), []);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStoreContext() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within StoreProvider');
  }
  return context;
}
