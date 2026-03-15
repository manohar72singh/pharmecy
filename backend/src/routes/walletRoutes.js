import { Router } from "express";
import authenticate from "../middleware/authMiddleware.js";
import { getWallet } from "../controllers/walletController.js";

const router = Router();
router.use(authenticate);
router.get("/", getWallet);
export default router;
