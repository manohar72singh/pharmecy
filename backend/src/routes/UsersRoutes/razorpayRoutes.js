import express from "express";
import { createRazorpayOrder, verifyPayment } from "../../controllers/UsersControllers/razorpayController.js";
import authenticate from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", authenticate, createRazorpayOrder);
router.post("/verify-payment", authenticate, verifyPayment);

export default router;
