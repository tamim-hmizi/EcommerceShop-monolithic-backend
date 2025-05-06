import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  validateCategory,
  validateCategoryId,
} from "../middleware/validators.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

router
  .route("/")
  .get(getCategories)
  .post(protect, admin, validateCategory, validateRequest, createCategory);

router
  .route("/:_id")
  .get(validateCategoryId, validateRequest, getCategoryById)
  .put(
    protect,
    admin,
    validateCategoryId,
    validateCategory,
    validateRequest,
    updateCategory
  )
  .delete(protect, admin, validateCategoryId, validateRequest, deleteCategory);

export default router;
