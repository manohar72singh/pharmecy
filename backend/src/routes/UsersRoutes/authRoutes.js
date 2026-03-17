import { Router } from "express";
import {
  register,
  verifyOTP,
  login,
  resendOTP,
  getMe,
  changePassword,
} from "../../controllers/UsersControllers//authController.js";
import authenticate from "../../middleware/authMiddleware.js";

const router = Router();

// ── Public ────────────────────────────────────────────
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/resend-otp", resendOTP);

// ── Protected ─────────────────────────────────────────
router.get("/me", authenticate, getMe);
router.put("/change-password", authenticate, changePassword);

export default router;
