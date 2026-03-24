import { Router } from "express";
import authenticate from "../../middleware/authMiddleware.js";
import {
  getNotifications,
  markRead,
  markOneRead,
} from "../../controllers/UsersControllers/NotificationController.js";

const router = Router();
router.use(authenticate);
router.get("/", getNotifications);
router.patch("/read-all", markRead);
router.patch("/:id/read", markOneRead);
export default router;
