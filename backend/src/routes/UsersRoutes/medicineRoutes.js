import { Router } from "express";
import {
  getMedicines,
  getMedicineById,
  getFeaturedMedicines,
  getCategories,
} from "../../controllers/UsersControllers/medicineController.js";

const router = Router();

router.get("/", getMedicines);
router.get("/featured", getFeaturedMedicines);
router.get("/categories", getCategories);
router.get("/:id", getMedicineById);

export default router;
