import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

// ── Types config ─────────────────────────────────────
const TYPES = {
  success: { icon: "✅", bg: "bg-emerald-500", border: "border-emerald-600" },
  error: { icon: "❌", bg: "bg-red-500", border: "border-red-600" },
  info: { icon: "ℹ️", bg: "bg-blue-500", border: "border-blue-600" },
  warning: { icon: "⚠️", bg: "bg-amber-400", border: "border-amber-500" },
  cart: { icon: "🛒", bg: "bg-teal-500", border: "border-teal-600" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, type = "success", duration = 3000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [],
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* ── Toast Container ── */}
      <div
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"
        style={{ maxWidth: "360px", width: "calc(100vw - 40px)" }}
      >
        {toasts.map((toast) => {
          const cfg = TYPES[toast.type] || TYPES.success;
          return (
            <div
              key={toast.id}
              className={`
                flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-2xl
                text-white text-sm font-semibold border-b-4
                pointer-events-auto cursor-pointer
                ${cfg.bg} ${cfg.border}
                animate-slideIn
              `}
              onClick={() => removeToast(toast.id)}
              style={{ animation: "slideIn 0.3s ease-out" }}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{cfg.icon}</span>
              <p className="flex-1 leading-snug">{toast.message}</p>
              <button className="text-white/70 hover:text-white text-lg leading-none flex-shrink-0 ml-1">
                ×
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// ── Custom Hook ───────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.showToast;
}
