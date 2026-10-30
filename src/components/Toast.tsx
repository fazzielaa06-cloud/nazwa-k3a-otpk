import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md pointer-events-none">
        {toasts.map(toast => {
          let bgClass = 'bg-white border-sky-300 text-slate-800 shadow-lg shadow-sky-900/10';
          let icon = <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />;

          if (toast.type === 'error') {
            bgClass = 'bg-white border-red-300 text-slate-800 shadow-lg shadow-red-900/10';
            icon = <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
          } else if (toast.type === 'warning') {
            bgClass = 'bg-white border-amber-300 text-slate-800 shadow-lg shadow-amber-900/10';
            icon = <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />;
          } else if (toast.type === 'info') {
            bgClass = 'bg-white border-sky-300 text-slate-800 shadow-lg shadow-sky-900/10';
            icon = <Info className="w-5 h-5 text-sky-600 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${bgClass} transition-all duration-200 animate-in slide-in-from-bottom-2 fade-in`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0 pr-1">
                <p className="font-semibold text-sm leading-tight text-slate-900">{toast.title}</p>
                {toast.message && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};
