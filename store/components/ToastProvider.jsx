"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ToastContext = createContext({
  showToast: () => {}
});

const toneStyles = {
  success: "bg-success text-white",
  error: "bg-danger text-white",
  info: "bg-primary text-white",
  warning: "bg-warning text-primary"
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({
      id: Date.now(),
      message,
      type
    });
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="pointer-events-none fixed left-0 right-0 top-3 z-[70] px-4">
          <div
            className={`toast-enter mx-auto max-w-container rounded-lg px-4 py-3 text-[15px] font-semibold shadow-lg ${toneStyles[toast.type] || toneStyles.info}`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
