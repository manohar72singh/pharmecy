import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastProvider } from "./context/Toastcontext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { Toaster } from "react-hot-toast";

// Suppress Razorpay console warnings in development
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    // Filter out Razorpay-related warnings
    if (
      args[0] &&
      typeof args[0] === "string" &&
      (args[0].includes("Refused to get unsafe header") ||
        args[0].includes("Permissions policy violation") ||
        args[0].includes("Mixed Content"))
    ) {
      return; // Suppress these warnings
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    // Filter out Razorpay-related errors that are harmless
    if (
      args[0] &&
      typeof args[0] === "string" &&
      (args[0].includes("Refused to get unsafe header") ||
        args[0].includes("Permissions policy violation"))
    ) {
      return; // Suppress these errors
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <SocketProvider>
        <Toaster />
        <App />
      </SocketProvider>
    </ToastProvider>
  </StrictMode>,
);
