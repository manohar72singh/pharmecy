import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let newSocket;

    const connectSocket = () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        if (newSocket) {
          newSocket.close();
          newSocket = null;
          setSocket(null);
        }
        return;
      }

      // Don't reconnect if already connected with a socket
      if (newSocket && newSocket.connected) return;

      const fallbackBackend = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      ).replace(/\/api\/?$/, "");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || fallbackBackend;

      newSocket = io(backendUrl, {
        auth: { token },
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log(
          "🟢 Connected to Real-time Notification Server:",
          newSocket.id,
        );
      });

      newSocket.on("new_notification", (notification) => {
        // If delivery notification, show partner name and phone with call link
        const deliveryPartnerName =
          notification.data?.delivery_boy_name ||
          notification.data?.db_name ||
          notification.data?.delivery_partner_name;
        const deliveryPartnerPhone =
          notification.data?.delivery_boy_phone ||
          notification.data?.db_phone ||
          notification.data?.delivery_partner_phone;

        const content = (
          <div className="flex flex-col">
            <strong className="text-sm font-bold text-gray-800">
              {notification.title}
            </strong>
            <span className="text-xs text-gray-600">
              {notification.message}
            </span>
            {deliveryPartnerName && (
              <div className="mt-2 text-[12px] flex items-center gap-2">
                <span className="font-semibold">Partner:</span>
                <span className="text-sm">{deliveryPartnerName}</span>
                {deliveryPartnerPhone && (
                  <a
                    className="ml-2 text-emerald-600 font-bold"
                    href={`tel:${deliveryPartnerPhone}`}
                  >
                    Call: {deliveryPartnerPhone}
                  </a>
                )}
              </div>
            )}
          </div>
        );

        toast.success(content, { duration: 6000, position: "top-right" });

        // Dispatch enriched event with normalized fields
        const enriched = {
          ...notification,
          delivery_partner_name: deliveryPartnerName || null,
          delivery_partner_phone: deliveryPartnerPhone || null,
        };

        window.dispatchEvent(
          new CustomEvent("new_notification", { detail: enriched }),
        );
      });

      newSocket.on("connect_error", (err) => {
        console.error("🔴 Socket Connection Error:", err.message);
      });
    };

    connectSocket();

    // Listen for login/logout to reconnect the socket dynamically
    window.addEventListener("profileUpdated", connectSocket);

    // Also check if token changes by polling (in case event isn't dispatched everywhere)
    const checkTokenInterval = setInterval(() => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!newSocket && token) {
        connectSocket();
      } else if (newSocket && !token) {
        newSocket.close();
        newSocket = null;
        setSocket(null);
      }
    }, 3000);

    return () => {
      if (newSocket) newSocket.close();
      window.removeEventListener("profileUpdated", connectSocket);
      clearInterval(checkTokenInterval);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
