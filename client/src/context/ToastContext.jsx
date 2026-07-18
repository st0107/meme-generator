import { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const value = useMemo(() => ({
    toast,
    showToast: (message, type = 'info') => setToast({ message, type }),
    dismissToast: () => setToast(null),
  }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-sm text-white shadow-xl">
          <div className="font-medium">{toast.type === 'error' ? 'Error' : 'Success'}</div>
          <div className="text-slate-300">{toast.message}</div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
