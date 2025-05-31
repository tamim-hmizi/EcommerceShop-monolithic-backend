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

// Get user's cart
router.get("/cart", protect, getUserCart);

// Save cart
router.post("/cart", protect, saveCart);

// Add item to cart
router.post("/cart/items", protect, addItemToCart);

// Update cart item
router.put("/cart/items/:itemId", protect, updateCartItem);

// Remove cart item
router.delete("/cart/items/:itemId", protect, removeCartItem);

// Clear cart
router.delete("/cart", protect, clearCart);

// Merge guest cart
router.post("/cart/merge", protect, mergeGuestCart);

export default router;
