'use client';

import { useState, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import { useUIStore } from '@/store/modules/ui';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useIncidentStore } from '@/store/modules/incident';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { AnimatePresence } from 'framer-motion';
import {
  Settings,
  Activity,
  AlertTriangle,
  Check,
  Languages,
  Sun,
  Moon,
  RotateCcw,
  Info
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AssistantLanguage } from '@/types/assistant';

const LANGS: Array<{ value: AssistantLanguage; label: string; desc: string }> = [
  { value: 'en', label: 'English', desc: 'EN' },
  { value: 'es', label: 'Español', desc: 'ES' },
  { value: 'fr', label: 'Français', desc: 'FR' },
  { value: 'pt', label: 'Português', desc: 'PT' },
  { value: 'hi', label: 'हिंदी', desc: 'HI' },
];

export default function SettingsPage() {
  const { telemetryFaultActive, setTelemetryFault, language, setLanguage } = useUIStore(
    useShallow((state) => ({
      telemetryFaultActive: state.telemetryFaultActive,
      setTelemetryFault: state.setTelemetryFault,
      language: state.language,
      setLanguage: state.setLanguage,
    }))
  );
  const { theme, setTheme } = useTheme();
  const { resetAll, addToast } = useIncidentStore(
    useShallow((state) => ({
      resetAll: state.resetAll,
      addToast: state.addToast,
    }))
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const firstBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    if (showConfirmModal) {
      // Store currently focused element
      triggerRef.current = document.activeElement as HTMLButtonElement;
      // Focus first button (Cancel) for safety
      setTimeout(() => {
        firstBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseModal();
        }
        if (e.key === 'Tab') {
          const first = firstBtnRef.current;
          const last = lastBtnRef.current;
          if (first && last) {
            if (e.shiftKey) {
              if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
              }
            } else {
              if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showConfirmModal]);

  const handleResetConfirm = () => {
    resetAll();
    addToast('Simulation and operations log reset completed', 'success');
    handleCloseModal();
  };

  return (
    <PageContainer>
      <div className="space-y-(--card-gap) animate-fade-in pb-10">
        {/* System Config Card */}
        <div className="bg-(--surface-1) border border-(--border) rounded-card p-6 flex flex-col gap-6">
          <div>
            <SectionHeader
              title="System Configuration &amp; Console Settings"
              description="Configure AI thresholds, sensor polling limits, theme settings, and personnel API nodes"
            />
          </div>

          {/* ── System Core Config Section ────────────────────── */}
          <div className="border border-(--border) rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-(--surface-2) border-b border-(--border)">
              <Settings size={12} className="text-(--primary)" />
              <h3 className="text-[10px] font-bold text-(--foreground) uppercase tracking-wider">System Core Config</h3>
            </div>
            <div className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-lg flex-1">
                <h4 className="text-xs font-semibold text-(--foreground)">AI Assessment &amp; Synchronization Rates</h4>
                <p className="text-[10.5px] text-(--foreground-muted) mt-0.5 leading-relaxed">
                  Tweak AI models sensitivity (the minimum confidence required to trigger recommendations) and database sync frequency.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto md:min-w-100">
                {/* AI Threshold slider */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-(--foreground-muted)">
                    <label htmlFor="ai-threshold-slider">AI Confidence Trigger</label>
                    <span className="font-mono text-(--primary)">80%</span>
                  </div>
                  <input
                    id="ai-threshold-slider"
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    defaultValue="80"
                    onChange={(e) => {
                      addToast(`AI confidence trigger threshold updated to ${e.target.value}%`, 'info');
                    }}
                    className="w-full accent-(--primary) h-1 bg-(--surface-3) rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Sync rate select */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-(--foreground-muted)">
                    <label htmlFor="data-sync-select">Data Sync Rate</label>
                  </div>
                  <select
                    id="data-sync-select"
                    defaultValue="5"
                    onChange={(e) => {
                      addToast(`Telemetry synchronization interval set to ${e.target.value}s`, 'info');
                    }}
                    className="w-full text-[10.5px] px-2 py-1.5 rounded border bg-(--surface-2) border-(--border) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--primary) cursor-pointer"
                  >
                    <option value="2">High Frequency (2s)</option>
                    <option value="5">Standard (5s)</option>
                    <option value="10">Battery Saver (10s)</option>
                    <option value="30">Manual Polling (30s)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Theme Preferences Section ───────────────────────── */}
          <div className="border border-(--border) rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-(--surface-2) border-b border-(--border)">
              <Sun size={12} className="text-(--primary)" />
              <h3 className="text-[10px] font-bold text-(--foreground) uppercase tracking-wider">Theme Preferences</h3>
            </div>
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="max-w-lg">
                <h4 className="text-xs font-semibold text-(--foreground)">Active Console Visual Mode</h4>
                <p className="text-[10.5px] text-(--foreground-muted) mt-0.5 leading-relaxed">
                  Switch the control center layout scheme. System theme auto-adjusts to OS defaults.
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-center" role="radiogroup" aria-label="Console Theme">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    role="radio"
                    aria-checked={theme === t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)',
                      theme === t
                        ? 'bg-(--primary) border-(--primary) text-white'
                        : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                    )}
                  >
                    {t === 'light' && <Sun size={12} />}
                    {t === 'dark' && <Moon size={12} />}
                    {t === 'system' && <Settings size={12} />}
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Language Preferences Section ────────────────────── */}
          <div className="border border-(--border) rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-(--surface-2) border-b border-(--border)">
              <Languages size={12} className="text-(--primary)" />
              <h3 className="text-[10px] font-bold text-(--foreground) uppercase tracking-wider">Language Preferences</h3>
            </div>
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="max-w-lg">
                <h4 className="text-xs font-semibold text-(--foreground)">AI Response Engine Language</h4>
                <p className="text-[10.5px] text-(--foreground-muted) mt-0.5 leading-relaxed">
                  Adjust the default translation node used by the GenAI Decision Copilot.
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 px-2 py-1 rounded">
                  <Info size={11} className="shrink-0" />
                  <span>Affects AI response output and decision reasoning analysis. Does not translate localized shell headers.</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center" role="radiogroup" aria-label="AI Language Preference">
                {LANGS.map((lang) => (
                  <button
                    key={lang.value}
                    role="radio"
                    aria-checked={language === lang.value}
                    onClick={() => setLanguage(lang.value)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)',
                      language === lang.value
                        ? 'bg-(--primary) border-(--primary) text-white'
                        : 'bg-(--surface-2) border-(--border) text-(--foreground-muted) hover:border-(--border-strong)'
                    )}
                  >
                    <span className="text-[9px] font-mono font-bold uppercase opacity-85 mr-1">
                      {lang.desc}
                    </span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Session / Data Controls ─────────────────────────── */}
          <div className="border border-red-900/20 dark:border-red-900/40 rounded-xl overflow-hidden bg-red-950/5">
            <div className="flex items-center gap-2 px-5 py-3 bg-red-950/10 border-b border-red-900/25">
              <RotateCcw size={12} className="text-red-500" />
              <h3 className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Session &amp; Data Controls</h3>
            </div>
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="max-w-lg">
                <h4 className="text-xs font-semibold text-red-700 dark:text-red-400">Reset Command Center Simulation</h4>
                <p className="text-[10.5px] text-(--foreground-muted) mt-0.5 leading-relaxed">
                  Permanently wipe all accumulated logs, reset incident queues back to initial mock profiles, and restore base system diagnostics telemetry.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2 text-xs font-bold rounded-md bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors duration-150 cursor-pointer self-start sm:self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                Reset Session
              </button>
            </div>
          </div>

          {/* ── System Diagnostics Section ───────────────────────── */}
          <div className="border border-(--border) rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 bg-(--surface-2) border-b border-(--border)">
              <Activity size={13} className="text-(--primary)" />
              <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">System Diagnostics</h3>
              <span className="ml-auto text-[9px] font-mono text-(--foreground-subtle) uppercase">Dev Controls</span>
            </div>

            <div className="divide-y divide-(--border)">
              {/* Telemetry Fault Toggle */}
              <div className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={12}
                      className={cn(
                        'shrink-0 transition-colors',
                        telemetryFaultActive ? 'text-red-500' : 'text-(--foreground-subtle)'
                      )}
                    />
                    <p className="text-xs font-semibold text-(--foreground)">Simulate Telemetry Fault</p>
                  </div>
                  <p className="text-[10.5px] text-(--foreground-muted) mt-1 leading-relaxed max-w-lg">
                    Activates the telemetry-disconnect error state across all lens pages (Crowd, Transport, Emergency,
                    Accessibility). Use to verify operator error recovery workflows without touching live sensor nodes.
                  </p>
                  {telemetryFaultActive && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-red-500 bg-red-950/15 border border-red-900/30 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                      FAULT ACTIVE — All lens pages showing error state
                    </div>
                  )}
                </div>

                {/* Toggle switch */}
                <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                  <button
                    id="telemetry-fault-toggle"
                    role="switch"
                    aria-checked={telemetryFaultActive}
                    aria-label={
                      telemetryFaultActive
                        ? 'Disable simulated telemetry fault'
                        : 'Enable simulated telemetry fault'
                    }
                    onClick={() => setTelemetryFault(!telemetryFaultActive)}
                    className={cn(
                      'relative w-11 h-6 rounded-full border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)',
                      telemetryFaultActive
                        ? 'bg-red-600/80 border-red-700'
                        : 'bg-(--surface-3) border-(--border)'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-5 h-5 rounded-full shadow-sm transition-all duration-200 flex items-center justify-center',
                        telemetryFaultActive
                          ? 'translate-x-5 bg-white'
                          : 'translate-x-0.5 bg-(--foreground-subtle)'
                      )}
                      aria-hidden="true"
                    >
                      {telemetryFaultActive && <AlertTriangle size={8} className="text-red-600" />}
                      {!telemetryFaultActive && <Check size={8} className="text-(--surface-1)" />}
                    </span>
                  </button>
                  <span className={cn(
                    'text-[9px] font-mono font-bold uppercase',
                    telemetryFaultActive ? 'text-red-500' : 'text-(--foreground-subtle)'
                  )}>
                    {telemetryFaultActive ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-(--border) pt-4 flex justify-between text-[9px] font-mono text-(--foreground-subtle)">
            <span>CONSOLE STATUS: OPERATIONAL</span>
            <span>FIFA WORLD CUP 2026</span>
          </div>
        </div>

        {/* Relocated project attribution info */}
        <div className="border border-(--border) rounded-card overflow-hidden">
          <AppFooter />
        </div>
      </div>

      {/* ── Reset Confirmation Dialog (Modal) ─────────────────── */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div
              className="bg-(--surface-1) border border-(--border) rounded-card shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="reset-modal-title"
              aria-describedby="reset-modal-desc"
            >
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2.5 text-red-600">
                  <AlertTriangle size={18} className="shrink-0" />
                  <h3 id="reset-modal-title" className="text-sm font-bold uppercase tracking-wide">
                    Destructive Action
                  </h3>
                </div>
                
                <p id="reset-modal-desc" className="text-xs text-(--foreground-muted) leading-relaxed">
                  Are you absolutely sure you want to clear session history and reset operations? This will revert all resolved tickets, restore initial telemetry values, and clear all logged activities. This action is irreversible.
                </p>

                <div className="flex justify-end items-center gap-2 mt-2">
                  <button
                    ref={firstBtnRef}
                    type="button"
                    onClick={handleCloseModal}
                    className="px-3.5 py-2 text-xs font-semibold rounded-md border border-(--border) bg-(--surface-2) text-(--foreground-muted) hover:text-(--foreground) hover:border-(--border-strong) cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                  >
                    Cancel
                  </button>
                  <button
                    ref={lastBtnRef}
                    type="button"
                    onClick={handleResetConfirm}
                    className="px-3.5 py-2 text-xs font-bold rounded-md bg-red-600 hover:bg-red-700 text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    Yes, Reset Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
