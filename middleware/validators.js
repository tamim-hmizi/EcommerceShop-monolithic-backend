import mongoose from "mongoose";
import { body, param, validationResult } from "express-validator";

// ----------------------
// Auth Validations
// ----------------------
export const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const updateProfileValidation = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Enter a valid email"),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
];

// ----------------------
// Category Validations
// ----------------------
export const validateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("description").trim().notEmpty().withMessage("Description is required"),
];

export const validateCategoryId = [
  param("_id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid category ID"),
];

// ----------------------
// Product Validations
// ----------------------
export const validateProduct = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("category")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid category ID"),
];

export const validateProductId = [
  param("_id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid product ID"),
];

// ----------------------
// Order Validations
// ----------------------
export const validateOrder = [
  body("orderItems")
    .isArray({ min: 1 })
    .withMessage("Order items must be a non-empty array"),

  body("orderItems.*.product")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid product ID in orderItems"),

  body("orderItems.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("shippingAddress.address").notEmpty().withMessage("Address is required"),
  body("shippingAddress.city").notEmpty().withMessage("City is required"),
  body("shippingAddress.postalCode")
    .notEmpty()
    .withMessage("Postal code is required"),
  body("shippingAddress.country").notEmpty().withMessage("Country is required"),

  body("totalPrice")
    .isFloat({ min: 0 })
    .withMessage("Total price must be a positive number"),
];
