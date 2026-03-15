import { Router } from "express";
import authenticate from "../../middleware/authMiddleware.js";
import {
  getStats,
  getRecentOrders,
} from "../../controllers/Admin/adminDashboardController.js";
import {
  getOrders,
  updateOrderStatus,
} from "../../controllers/Admin/adminOrdersController.js";
import {
  getUsers,
  updateUserRole,
  toggleUserStatus,
} from "../../controllers/Admin/adminUsersController.js";
import {
  getPrescriptions,
  updatePrescriptionStatus,
} from "../../controllers/Admin/adminPrescriptionsController.js";
import {
  getMedicines,
  toggleMedicineStatus,
} from "../../controllers/Admin/adminMedicinesController.js";
import {
  getStock,
  updateStock,
} from "../../controllers/Admin/adminStockController.js";
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
} from "../../controllers/Admin/adminCouponsController.js";
import {
  getSuppliers,
  createSupplier,
  deleteSupplier,
} from "../../controllers/Admin/adminSuppliersController.js";
import {
  getDeliveryOrders,
  assignDelivery,
} from "../../controllers/Admin/adminDeliveryController.js";
import { getReports } from "../../controllers/Admin/adminReportsController.js";
import { getSubscriptions } from "../../controllers/Admin/adminSubscriptionsController.js";
import { getPurchaseOrders } from "../../controllers/Admin/adminPurchaseController.js";

const router = Router();
router.use(authenticate);

// Dashboard
router.get("/dashboard/stats", getStats);
router.get("/dashboard/recent-orders", getRecentOrders);

// Orders
router.get("/orders", getOrders);
router.put("/orders/:id/status", updateOrderStatus);

// Users
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.patch("/users/:id/toggle", toggleUserStatus);

// Prescriptions
router.get("/prescriptions", getPrescriptions);
router.put("/prescriptions/:id/status", updatePrescriptionStatus);

// Medicines
router.get("/medicines", getMedicines);
router.patch("/medicines/:id/toggle", toggleMedicineStatus);

// Stock
router.get("/stock", getStock);
router.put("/stock/:id", updateStock);

// Coupons
router.get("/coupons", getCoupons);
router.post("/coupons", createCoupon);
router.delete("/coupons/:id", deleteCoupon);

// Suppliers
router.get("/suppliers", getSuppliers);
router.post("/suppliers", createSupplier);
router.delete("/suppliers/:id", deleteSupplier);

// Delivery
router.get("/delivery", getDeliveryOrders);
router.post("/delivery/:order_id/assign", assignDelivery);

// Reports
router.get("/reports", getReports);

// Subscriptions
router.get("/subscriptions", getSubscriptions);

// Purchase
router.get("/purchase", getPurchaseOrders);

export default router;
