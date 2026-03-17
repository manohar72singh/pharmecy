import { Router } from "express";
import authenticate from "../../middleware/authMiddleware.js";
import {
  placeOrder,
  getMyOrders,
  getOrderDetail,
  cancelOrder,
} from "../../controllers/UsersControllers/orderController.js";

const router = Router();

router.use(authenticate);

router.post("/", placeOrder); // POST   /api/orders
router.get("/", getMyOrders); // GET    /api/orders
router.get("/:id", getOrderDetail); // GET    /api/orders/:id
router.put("/:id/cancel", cancelOrder); // PUT    /api/orders/:id/cancel

export default router;
