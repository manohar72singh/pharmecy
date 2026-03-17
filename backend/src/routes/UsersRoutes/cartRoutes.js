import { Router } from "express";
import authenticate from "../../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncCart,
} from "../../controllers/UsersControllers/cartController.js";

const router = Router();

router.use(authenticate); // sab routes protected

router.get("/", getCart); // GET    /api/cart
router.post("/", addToCart); // POST   /api/cart
router.post("/sync", syncCart); // POST   /api/cart/sync
router.put("/:id", updateCartItem); // PUT    /api/cart/:id
router.delete("/clear", clearCart); // DELETE /api/cart/clear
router.delete("/:id", removeCartItem); // DELETE /api/cart/:id

export default router;
