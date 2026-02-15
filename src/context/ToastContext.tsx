"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Check, AlertCircle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Support splitting message into Title and Description using newline
    const parts = message.split('\n');
    const title = parts[0];
    const description = parts.slice(1).join('\n');

    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-4 p-5 rounded-[2rem] shadow-2xl border-none backdrop-blur-md transform transition-all duration-500 animate-fade-in-up min-w-[340px] max-w-md
              ${toast.type === 'success' ? 'bg-[#bbf7d0] text-green-900' : // green-200
                toast.type === 'error' ? 'bg-[#fecaca] text-red-900' : // red-200
                'bg-[#bfdbfe] text-blue-900'} // blue-200
            `}
          >
            <div className={`
              w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm
              ${toast.type === 'success' ? 'text-green-600' :
                toast.type === 'error' ? 'text-red-500' :
                'text-blue-500'}
            `}>
              {toast.type === 'success' && <Check size={24} strokeWidth={3} />}
              {toast.type === 'error' && <span className="text-2xl font-bold leading-none mb-1">!</span>}
              {toast.type === 'info' && <Info size={24} strokeWidth={3} />}
            </div>
            
            <div className="flex-1 pt-1">
               <h4 className="font-bold text-base leading-tight">{toast.title}</h4>
               {toast.description && (
                 <p className="text-sm mt-1 opacity-90 font-medium leading-relaxed">
                   {toast.description}
                 </p>
               )}
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className={`p-1 -mt-1 -mr-1 hover:bg-black/5 rounded-full transition-colors opacity-60 hover:opacity-100`}
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
