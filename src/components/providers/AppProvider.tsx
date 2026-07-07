'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { StoreProvider } from './StoreProvider';
import { MotionProvider } from './MotionProvider';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <StoreProvider>
      <ThemeProvider>
        <MotionProvider>
          {children}
        </MotionProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
