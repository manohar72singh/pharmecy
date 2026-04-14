import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastProvider } from "./context/Toastcontext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { Toaster } from "react-hot-toast";

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
