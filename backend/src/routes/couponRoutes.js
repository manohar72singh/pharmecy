// import { Router } from "express";
// import authenticate from "../middleware/authMiddleware.js";
// import {
//   getActiveCoupons,
//   applyCoupon,
// } from "../controllers/couponController.js";

// const router = Router();

// router.get("/", getActiveCoupons); // Public — GET  /api/coupons
// router.post("/apply", authenticate, applyCoupon); // Auth   — POST /api/coupons/apply

// export default router;

import { Router } from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  getActiveCoupons,
  applyCoupon,
} from "../controllers/couponController.js";

// Optional auth middleware
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(); // No token — guest user
  authenticate(req, res, next); // Token hai — verify karo
};

const router = Router();

router.get("/", optionalAuth, getActiveCoupons); // Optional auth
router.post("/apply", authenticate, applyCoupon); // Required auth

export default router;
