import { Router } from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  getPlans,
  getMySubscriptions,
  createSubscription,
  togglePause,
  cancelSubscription,
  getSubscriptionOrders,
} from "../controllers/subscriptionController.js";

const router = Router();

// Public
router.get("/plans", getPlans); // GET /api/subscriptions/plans

// Protected
router.use(authenticate);
router.get("/", getMySubscriptions); // GET    /api/subscriptions
router.post("/", createSubscription); // POST   /api/subscriptions
router.patch("/:id/toggle", togglePause); // PATCH  /api/subscriptions/:id/toggle
router.delete("/:id", cancelSubscription); // DELETE /api/subscriptions/:id
router.get("/:id/orders", getSubscriptionOrders); // GET    /api/subscriptions/:id/orders

export default router;
