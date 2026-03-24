import { Router } from "express";
import authenticate from "../../middleware/authMiddleware.js";

import {
  getDeliveryProfile,
  toggleAvailability,
} from "../../controllers/DeliveryController/deliveryAuthController.js";

import {
  getAssignedOrders,
  getOrderDetail,
  verifyOTP,
} from "../../controllers/DeliveryController/deliveryOrderController.js";
import {
  getEarnings,
  getDeliveryHistory,
} from "../../controllers/DeliveryController/deliveryEarningsController.js";

const router = Router();
router.use(authenticate);

// Profile & Availability
router.get("/profile", getDeliveryProfile);
router.patch("/availability", toggleAvailability);

// Orders
router.get("/orders", getAssignedOrders);
router.get("/orders/:id", getOrderDetail);
router.post("/orders/:id/verify-otp", verifyOTP);

// Earnings & History
router.get("/earnings", getEarnings);
router.get("/history", getDeliveryHistory);

export default router;
