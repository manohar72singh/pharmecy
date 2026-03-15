import { Router } from "express";
import authenticate from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  changePassword,
} from "../controllers/userController.js";

// Multer config — profile photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profiles/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only jpg/png/webp allowed"));
  },
});

const router = Router();
router.use(authenticate);

router.get("/", getProfile); // GET  /api/users/profile
router.put("/", updateProfile); // PUT  /api/users/profile
router.put("/change-password", changePassword); // PUT  /api/users/profile/change-password
router.post("/photo", upload.single("photo"), uploadProfilePhoto); // POST /api/users/profile/photo

export default router;
