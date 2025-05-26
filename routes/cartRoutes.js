import express from "express";
import {
  getUserCart,
  saveCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Get user's cart
router.get("/cart", getUserCart);

// Save cart
router.post("/cart", saveCart);

// Add item to cart
router.post("/cart/items", addItemToCart);

// Update cart item
router.put("/cart/items/:itemId", updateCartItem);

// Remove cart item
router.delete("/cart/items/:itemId", removeCartItem);

// Clear cart
router.delete("/cart", clearCart);

// Merge guest cart
router.post("/cart/merge", mergeGuestCart);

export default router;
