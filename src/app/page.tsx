import React from 'react';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-6 text-center bg-background font-sans">
      <main className="w-full max-w-xl p-8 bg-card rounded-custom shadow-md border border-zinc-200">
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">VenueMind AI</h1>
        <p className="mt-2 text-lg font-medium text-secondary">
          One AI Brain. Every Stadium Decision.
        </p>
        <div className="mt-6 p-4 rounded-lg bg-zinc-50 border border-zinc-100 text-sm text-zinc-600 text-left space-y-2">
          <p>
            <strong>GenAI-powered Stadium Operations Copilot</strong> designed for FIFA World Cup
            2026.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Fans:</strong> Navigation, safety updates, schedules
            </li>
            <li>
              <strong>Volunteers:</strong> Incident reporting, crowd management support
            </li>
            <li>
              <strong>Operations:</strong> Real-time alerts, dashboard, timeline tracking
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
