import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatusAndPayment,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateOrder } from "../middleware/validators.js";
const router = express.Router();

router.post("/", protect, validateOrder, validateRequest, createOrder);
router.get("/", protect, getUserOrders);
router.get("/all", protect, admin, getAllOrders);
router.put(
  "/:_id",
  protect,
  admin,
  validateRequest,
  updateOrderStatusAndPayment
);

export default router;
