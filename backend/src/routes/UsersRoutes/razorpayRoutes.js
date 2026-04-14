import express from "express";
import { createRazorpayOrder, verifyPayment } from "../../controllers/UsersControllers/razorpayController.js";
import { authenticateUser } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", authenticateUser, createRazorpayOrder);
router.post("/verify-payment", authenticateUser, verifyPayment);

export default router;
