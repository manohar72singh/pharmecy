import { Router } from "express";
import authenticate from "../../middleware/authMiddleware.js";
import multer from "multer";
import { upload } from "../../config/cloudinary.js";
import path from "path";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  changePassword,
} from "../../controllers/UsersControllers/userController.js";

const router = Router();
router.use(authenticate);

router.get("/", getProfile); // GET  /api/users/profile
router.put("/", updateProfile); // PUT  /api/users/profile
router.put("/change-password", changePassword); // PUT  /api/users/profile/change-password
router.post("/photo", upload.single("photo"), uploadProfilePhoto); // POST /api/users/profile/photo

export default router;
