import { Router } from "express";
import authenticate from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import {
  getMyPrescriptions,
  uploadPrescription,
  deletePrescription,
} from "../controllers/prescriptionController.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/prescriptions/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `rx_${req.user.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only jpg/png/webp/pdf allowed"));
  },
});

const router = Router();
router.use(authenticate);

router.get("/", getMyPrescriptions); // GET    /api/prescriptions
router.post("/", upload.single("prescription"), uploadPrescription); // POST /api/prescriptions
router.delete("/:id", deletePrescription); // DELETE /api/prescriptions/:id

export default router;
