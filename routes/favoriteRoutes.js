import express from "express";
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();



// Get all favorites
router.get("/favorites",protect, getFavorites);

// Check if product is in favorites
router.get("/favorites/:productId",protect, checkFavorite);

// Add product to favorites
router.post("/favorites/:productId",protect, addToFavorites);

// Remove product from favorites
router.delete("/favorites/:productId",protect, removeFromFavorites);

export default router;
