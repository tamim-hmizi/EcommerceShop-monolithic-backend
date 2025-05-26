import express from "express";
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Get all favorites
router.get("/favorites", getFavorites);

// Check if product is in favorites
router.get("/favorites/:productId", checkFavorite);

// Add product to favorites
router.post("/favorites/:productId", addToFavorites);

// Remove product from favorites
router.delete("/favorites/:productId", removeFromFavorites);

export default router;
