import { Router } from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressControlle.js";

const router = Router();
router.use(authenticate);

router.get("/", getAddresses); // GET    /api/addresses
router.post("/", addAddress); // POST   /api/addresses
router.put("/:id", updateAddress); // PUT    /api/addresses/:id
router.delete("/:id", deleteAddress); // DELETE /api/addresses/:id
router.patch("/:id/default", setDefaultAddress); // PATCH  /api/addresses/:id/default

export default router;
