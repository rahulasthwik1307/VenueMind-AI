import React from 'react';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4" role="status" aria-busy="true">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium text-zinc-600">{message}</span>
    </div>
  );
}
