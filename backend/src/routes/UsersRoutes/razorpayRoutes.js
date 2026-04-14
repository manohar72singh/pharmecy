import express from "express";
import { prepareRazorpayOrder, verifyAndPlaceOrder } from "../../controllers/UsersControllers/razorpayController.js";
import { handleRazorpayWebhook } from "../../controllers/UsersControllers/razorpayWebhookController.js";
import authenticate from "../../middleware/authMiddleware.js";

const router = express.Router();

// Client-side routes (Authenticated)
router.post("/prepare-order", authenticate, prepareRazorpayOrder);
router.post("/verify-and-place", authenticate, verifyAndPlaceOrder);

// Webhook route (Public - called by Razorpay)
// NOTE: This requires raw body handling in server.js for signature verification
router.post("/webhook", handleRazorpayWebhook);

export default router;
