import express from "express";
import cors from "cors";
import helmet from "helmet";
// import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pool from "./src/config/db.js";
import authRoute from "./src/routes/UsersRoutes/authRoutes.js";
import medicineRoute from "./src/routes/UsersRoutes/medicineRoutes.js";
import cartRoutes from "./src/routes/UsersRoutes/cartRoutes.js";
import addressRoutes from "./src/routes/UsersRoutes/addressRoutes.js";
import orderRoutes from "./src/routes/UsersRoutes/orderRoutes.js";
import userRoutes from "./src/routes/UsersRoutes/userRoutes.js";
import couponRoutes from "./src/routes/UsersRoutes/couponRoutes.js";
import subscriptionRoutes from "./src/routes/UsersRoutes/subscriptionRoutes.js";
import prescriptionRoutes from "./src/routes/UsersRoutes/prescriptionRoutes.js";
import wishlistRoutes from "./src/routes/UsersRoutes/wishlistRoutes.js";
import reviewRoutes from "./src/routes/UsersRoutes/reviewRoutes.js";
import notificationRoutes from "./src/routes/UsersRoutes/notificationRoutes.js";
import walletRoutes from "./src/routes/UsersRoutes/walletRoutes.js";
import adminRoutes from "./src/routes/AdminRoutes/adminRoutes.js";
import deliveryRoutes from "./src/routes/DeliveryRoutes/deliveryRoutes.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
// app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Pharmacy API is running 🚀" });
});

// Routes yahan add karna baad mein
app.use("/api/auth", authRoute);
app.use("/api/medicines", medicineRoute);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌿 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
