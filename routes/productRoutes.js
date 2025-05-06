import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  validateProduct,
  validateProductId,
} from "../middleware/validators.js";

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    admin,
    upload.single("image"),
    validateProduct,
    validateRequest,
    createProduct
  );

router
  .route("/:_id")
  .get(validateProductId, validateRequest, getProductById)
  .put(
    protect,
    admin,
    upload.single("image"),
    validateProductId,
    validateProduct,
    validateRequest,
    updateProduct
  )
  .delete(protect, admin, validateProductId, validateRequest, deleteProduct);

export default router;
