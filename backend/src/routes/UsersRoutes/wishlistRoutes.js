import { Router } from "express";
import authenticate from "../../middleware/authMiddleware.js";
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} from "../../controllers/UsersControllers/wishlistController.js";

const router = Router();
router.use(authenticate);
router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
router.delete("/:medicine_id", removeFromWishlist);
export default router;
