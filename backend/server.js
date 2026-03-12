import express from "express";
import cors from "cors";
import helmet from "helmet";
// import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pool from "./src/config/db.js";
import authRoute from "./src/routes/authRoutes.js";
import medicineRoute from "./src/routes/medicineRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
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
