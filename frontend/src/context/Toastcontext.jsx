import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const ToastContext = createContext(null);

// ── Toast Type Configs ────────────────────────────────
const TYPES = {
  success: {
    icon: "✅",
    accent: "#10b981",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#065f46",
    progress: "from-emerald-500 to-emerald-400",
  },
  error: {
    icon: "❌",
    accent: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
    text: "#7f1d1d",
    progress: "from-red-500 to-red-400",
  },
  warning: {
    icon: "⚠️",
    accent: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    text: "#78350f",
    progress: "from-amber-500 to-amber-400",
  },
  info: {
    icon: "ℹ️",
    accent: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    text: "#1e3a8a",
    progress: "from-blue-500 to-blue-400",
  },
  order: {
    icon: "📦",
    accent: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    text: "#4c1d95",
    progress: "from-violet-500 to-violet-400",
  },
  delivery: {
    icon: "🚴",
    accent: "#14b8a6",
    bg: "#f0fdfa",
    border: "#99f6e4",
    text: "#134e4a",
    progress: "from-teal-500 to-teal-400",
  },
  prescription: {
    icon: "💊",
    accent: "#06b6d4",
    bg: "#ecfeff",
    border: "#a5f3fc",
    text: "#164e63",
    progress: "from-cyan-500 to-cyan-400",
  },
};

// ── CSS Keyframes ─────────────────────────────────────
const STYLES = `
  @keyframes toastSlideIn {
    0%   { transform: translateX(115%) scale(0.92); opacity: 0; }
    60%  { transform: translateX(-6px) scale(1.02); opacity: 1; }
    100% { transform: translateX(0)    scale(1);    opacity: 1; }
  }
  @keyframes toastSlideOut {
    0%   { transform: translateX(0)    scale(1);    opacity: 1; }
    100% { transform: translateX(115%) scale(0.92); opacity: 0; }
  }
  @keyframes cartBounce {
    0%,100% { transform: translateY(0)    rotate(0deg);  }
    25%     { transform: translateY(-6px) rotate(-8deg); }
    50%     { transform: translateY(-3px) rotate(4deg);  }
    75%     { transform: translateY(-5px) rotate(-4deg); }
  }
  @keyframes checkPop {
    0%   { transform: scale(0)   rotate(-30deg); opacity: 0; }
    60%  { transform: scale(1.4) rotate(6deg);   opacity: 1; }
    100% { transform: scale(1)   rotate(0deg);   opacity: 1; }
  }
  @keyframes iconPulse {
    0%,100% { transform: scale(1);    }
    50%     { transform: scale(1.15); }
  }
  @keyframes progressShrink {
    from { width: 100%; }
    to   { width: 0%;   }
  }

  .toast-enter  { animation: toastSlideIn  0.5s cubic-bezier(0.34,1.4,0.64,1) forwards; }
  .toast-exit   { animation: toastSlideOut 0.38s cubic-bezier(0.4,0,1,1) forwards;      }
  .cart-bounce  { animation: cartBounce    0.7s ease 0.1s both;                          }
  .check-pop    { animation: checkPop      0.45s cubic-bezier(0.34,1.56,0.64,1) 0.35s both; }
  .icon-pulse   { animation: iconPulse     0.6s ease 0.1s both;                          }
  .progress-bar { animation: progressShrink var(--dur, 3s) linear forwards;              }
`;

// ── Cart Toast Card ───────────────────────────────────
function CartToastCard({ toast, onRemove }) {
  return (
    <div
      className={`pointer-events-auto w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-emerald-100 ${toast.hiding ? "toast-exit" : "toast-enter"}`}
    >
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        {/* Animated cart icon */}
        <div className="cart-bounce relative flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          {/* Check badge */}
          <div className="check-pop absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-2.5 h-2.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate leading-tight">
            {toast.name || "Item"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Added to cart successfully!{" "}
            {toast.price && (
              <span className="text-emerald-600 font-bold">{toast.price}</span>
            )}
          </p>
          {toast.qty && (
            <p className="text-xs text-gray-300 mt-0.5">
              Quantity: {toast.qty}
            </p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-400 flex items-center justify-center text-gray-400 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-gray-100">
        <div
          className="progress-bar h-full rounded-r-full bg-gradient-to-r from-emerald-500 via-emerald-300 to-emerald-500"
          style={{ "--dur": `${toast.dur || 3}s` }}
        />
      </div>
    </div>
  );
}

// ── Normal Toast Card ─────────────────────────────────
function NormalToastCard({ toast, onRemove }) {
  const cfg = TYPES[toast.type] || TYPES.success;

  return (
    <div
      className={`pointer-events-auto w-full rounded-2xl overflow-hidden shadow-2xl ${toast.hiding ? "toast-exit" : "toast-enter"}`}
      style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Icon */}
        <div
          className="icon-pulse flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{
            background: cfg.accent + "18",
            border: `1px solid ${cfg.accent}30`,
          }}
        >
          {cfg.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          {toast.title && (
            <p
              className="text-xs font-black uppercase tracking-wider mb-0.5"
              style={{ color: cfg.accent }}
            >
              {toast.title}
            </p>
          )}
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: cfg.text }}
          >
            {toast.message}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-opacity opacity-40 hover:opacity-90 mt-0.5"
          style={{ color: cfg.text }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[3px]" style={{ background: cfg.accent + "20" }}>
        <div
          className={`progress-bar h-full rounded-r-full bg-gradient-to-r ${cfg.progress}`}
          style={{ "--dur": `${toast.dur || 3}s` }}
        />
      </div>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, hiding: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  }, []);

  const addToast = useCallback(
    (toastObj, duration = 3000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [
        ...prev,
        { id, hiding: false, dur: duration / 1000, ...toastObj },
      ]);
      timers.current[id] = setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast],
  );

  /**
   * showToast(message, type?, duration?, extra?)
   */
  const showToast = useCallback(
    (message, type = "success", duration = 3000, extra = {}) => {
      return addToast({ type, message, ...extra }, duration);
    },
    [addToast],
  );

  /**
   * showCartToast({ name, price?, qty? })
   */
  const showCartToast = useCallback(
    (medicine, duration = 3000) => {
      return addToast({ type: "cart", ...medicine }, duration);
    },
    [addToast],
  );

  /**
   * dismiss(id)
   */
  const dismiss = useCallback((id) => removeToast(id), [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, showCartToast, dismiss }}>
      {children}
      <style>{STYLES}</style>

      {/* Container */}
      <div
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none"
        style={{ width: "min(340px, calc(100vw - 40px))" }}
      >
        {toasts.map((toast) =>
          toast.type === "cart" ? (
            <CartToastCard
              key={toast.id}
              toast={toast}
              onRemove={removeToast}
            />
          ) : (
            <NormalToastCard
              key={toast.id}
              toast={toast}
              onRemove={removeToast}
            />
          ),
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
