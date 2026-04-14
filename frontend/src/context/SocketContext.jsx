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
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
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

            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

            newSocket = io(backendUrl, {
                auth: { token },
            });

            setSocket(newSocket);

            newSocket.on("connect", () => {
                 console.log("🟢 Connected to Real-time Notification Server:", newSocket.id);
            });

            newSocket.on("new_notification", (notification) => {
                toast.success(
                   <div className="flex flex-col">
                       <strong className="text-sm font-bold text-gray-800">{notification.title}</strong>
                       <span className="text-xs text-gray-600">{notification.message}</span>
                   </div>,
                   {
                     duration: 5000,
                     position: "top-right",
                   }
                );

                window.dispatchEvent(new CustomEvent("new_notification", { detail: notification }));
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
           const token = localStorage.getItem("token") || sessionStorage.getItem("token");
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
