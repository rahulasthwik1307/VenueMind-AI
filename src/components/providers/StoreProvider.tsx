'use client';

import React, { createContext, useContext, useRef } from 'react';

// Context for the store
const StoreContext = createContext<any>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Store context can be used to hold store instances for SSR isolation if required.
  // For now, it is a simple shell wrapper.
  const valueRef = useRef({});
  return (
    <StoreContext.Provider value={valueRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within StoreProvider');
  }
  return context;
}
