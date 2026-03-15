import { Router } from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  getMedicineReviews,
  addReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = Router();
router.get("/medicine/:medicine_id", getMedicineReviews); // Public
router.post("/", authenticate, addReview);
router.delete("/:id", authenticate, deleteReview);
export default router;
