'use client';

import { useIncident } from '@/hooks/useIncident';
import { m, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useEffect } from 'react';

export function ToastContainer() {
  const { toasts, removeToast } = useIncident();

  return (
    <div 
      className="fixed bottom-20 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
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
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle className="text-green-500 shrink-0" size={14} />,
    info: <Info className="text-blue-500 shrink-0" size={14} />,
    warning: <AlertTriangle className="text-yellow-500 shrink-0" size={14} />,
    error: <AlertOctagon className="text-red-500 shrink-0" size={14} />,
  };

  const bgStyles: Record<string, string> = {
    success: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900 text-green-800 dark:text-green-200',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 text-blue-800 dark:text-blue-200',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900 text-red-800 dark:text-red-200',
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -15 }}
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
