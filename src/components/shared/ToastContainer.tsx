'use client';

import { useIncident } from '@/hooks/useIncident';
import { m, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useEffect } from 'react';

export function ToastContainer() {
  const { toasts, removeToast } = useIncident();

  // Show at most 4 toasts at a time to prevent clutter
  const visibleToasts = toasts.slice(-4);

  return (
    <div 
      className="fixed top-16 right-5 z-9999 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {visibleToasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: { id: string; message: string; type: string };
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  useEffect(() => {
    // Critical (error) = 15s, Warning (warning) = 4s, Info/Success = 3s
    const duration = toast.type === 'error' ? 15000 : toast.type === 'warning' ? 4000 : 3000;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast.type, onClose]);

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle className="text-emerald-500 shrink-0" size={14} />,
    info: <Info className="text-blue-500 shrink-0" size={14} />,
    warning: <AlertTriangle className="text-amber-500 shrink-0" size={14} />,
    error: <AlertOctagon className="text-red-500 shrink-0" size={14} />,
  };

  const bgStyles: Record<string, string> = {
    success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 text-blue-800 dark:text-blue-200',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 text-amber-800 dark:text-amber-200',
    error: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900 text-red-800 dark:text-red-200',
  };

  return (
    <m.div
      initial={{ opacity: 0, y: -15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-md border shadow-md ${
        bgStyles[toast.type] || bgStyles.info
      }`}
      role="alert"
    >
      <div className="flex items-center gap-2 min-w-0">
        {icons[toast.type] || icons.info}
        <span className="text-[11px] font-semibold leading-tight truncate">{toast.message}</span>
      </div>
      <button
        onClick={onClose}
        className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0 text-current opacity-60 hover:opacity-100 focus:outline-none"
        aria-label="Dismiss notification"
      >
        <X size={12} />
      </button>
    </m.div>
  );
}
