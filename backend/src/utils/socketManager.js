import { Server } from "socket.io";
import { verifyToken } from "./jwt.js"; // Assuming jwt.js contains verifyToken

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://pharmecy-1.onrender.com",
        "https://pharmecy-2.onrender.com",
        process.env.FRONTEND_URL,
      ].filter(Boolean),
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User ID: ${socket.user.id}, Role: ${socket.user.role_name || socket.user.role_id})`);

    // Join specific user room
    socket.join(`user_${socket.user.id}`);

    // Join role-based room (e.g., admin, delivery)
    const adminRoles = ["admin", "super_admin", "pharmacist"];
    const deliveryRoles = ["delivery", "delivery_boy", "delivery_partner"];

    if (adminRoles.includes(socket.user.role_name) || socket.user.role_id === 1) {
      socket.join("role_admin");
    } 
    if (deliveryRoles.includes(socket.user.role_name) || socket.user.role_id === 4) { 
      socket.join("role_delivery");
    }

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
