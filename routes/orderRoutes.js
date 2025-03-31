import express from "express";
import { createOrder, getUserOrders, getAllOrders, createPaymentIntent, handleStripeWebhook } from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getUserOrders);
router.get("/all", protect, admin, getAllOrders); // Admin-only route
router.post("/create-payment-intent", protect, createPaymentIntent);
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

export default router;
