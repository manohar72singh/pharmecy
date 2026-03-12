import { useState, useEffect, useCallback } from "react";

// ── Global toast trigger ──────────────────────────────
let _toastFn = null;
export const showCartToast = (medicine) => {
  if (_toastFn) _toastFn(medicine);
};

export default function CartToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _toastFn = (medicine) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, hiding: false, ...medicine }]);
      setTimeout(() => removeToast(id), 3000);
    };
    return () => {
      _toastFn = null;
    };
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, hiding: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 350);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes toastOut {
          from { transform: translateX(0);   opacity: 1; }
          to   { transform: translateX(110%); opacity: 0; }
        }
        @keyframes iconBounce {
          0%,100% { transform: translateY(0); }
          30%     { transform: translateY(-5px); }
          60%     { transform: translateY(-2px); }
        }
        @keyframes checkPop {
          0%   { transform: scale(0.2) rotate(-20deg); opacity: 0; }
          65%  { transform: scale(1.3) rotate(5deg);  opacity: 1; }
          100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .toast-in       { animation: toastIn   0.45s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .toast-out      { animation: toastOut  0.35s ease-in forwards; }
        .toast-bounce   { animation: iconBounce 0.6s ease 0.3s both; }
        .toast-check    { animation: checkPop  0.4s cubic-bezier(0.34,1.56,0.64,1) 0.4s both; }
        .toast-progress { animation: shrink 3s linear forwards; }
      `}</style>

      {/* ✅ top-5 right-5 — upar right corner mein */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto w-80 bg-white rounded-2xl overflow-hidden
              shadow-xl border border-emerald-100
              ${toast.hiding ? "toast-out" : "toast-in"}
            `}
          >
            {/* Card body */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              {/* Icon */}
              <div className="toast-bounce relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
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
                <div className="toast-check absolute -top-1 -right-1 w-[18px] h-[18px] bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
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
                <p className="text-sm font-bold text-emerald-900 truncate">
                  {toast.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cart mein add ho gaya!{" "}
                  {toast.price && (
                    <span className="text-emerald-600 font-semibold">
                      {toast.price}
                    </span>
                  )}
                </p>
              </div>

              {/* Close */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
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
              <div className="toast-progress h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-r-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
