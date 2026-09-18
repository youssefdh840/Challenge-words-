import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Award,
  Swords,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
} from 'lucide-react';

export type ToastType = 'achievement' | 'challenge' | 'success' | 'info' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { ...toast, id };

      setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // max 4 toasts at once

      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Floating Toast Notification Deck */}
      <aside aria-label="Notifications" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const isDarkScheme = toast.type === 'achievement' || toast.type === 'challenge';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className={`pointer-events-auto rounded-2xl p-4 border shadow-2xl backdrop-blur-md flex items-start gap-3.5 select-none transition-colors ${
                  isDarkScheme
                    ? 'bg-stone-950/95 text-white border-stone-800'
                    : 'bg-white/95 dark:bg-[#171719]/95 text-stone-900 dark:text-stone-100 border-stone-200/90 dark:border-stone-800'
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                    toast.type === 'achievement'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : toast.type === 'challenge'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : toast.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : toast.type === 'error'
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {toast.type === 'achievement' && <Award className="w-4 h-4" />}
                  {toast.type === 'challenge' && <Swords className="w-4 h-4" />}
                  {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
                  {toast.type === 'info' && <Sparkles className="w-4 h-4 text-amber-500" />}
                </div>

                {/* Body Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="font-display text-xs font-bold tracking-tight truncate">
                      {toast.title}
                    </h5>
                    <button
                      type="button"
                      onClick={() => dismissToast(toast.id)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-0.5 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="font-sans-clean text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug line-clamp-2">
                    {toast.message}
                  </p>

                  {toast.actionLabel && toast.onAction && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.onAction?.();
                        dismissToast(toast.id);
                      }}
                      className="mt-2.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 text-[11px] font-display font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>{toast.actionLabel}</span>
                      <ArrowRight className="w-3 h-3 text-amber-500" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
