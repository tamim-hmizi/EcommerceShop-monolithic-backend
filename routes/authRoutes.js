import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} from "../controllers/authController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  loginValidation,
  registerValidation,
  updateProfileValidation,
} from "../middleware/validators.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { profilePictureUpload } from "../utils/upload.js";
const router = express.Router();

router.post(
  "/auth/register",
  registerValidation,
  validateRequest,
  registerUser
);
router.post("/auth/login", loginValidation, validateRequest, loginUser);

// User Routes
router.put(
  "/users/profile",
  protect,
  updateProfileValidation,
  validateRequest,
  updateUserProfile
);

// Profile Picture Routes
router.post(
  "/users/profile/picture",
  protect,
  profilePictureUpload.single("profilePicture"),
  uploadProfilePicture
);

router.delete(
  "/users/profile/picture",
  protect,
  deleteProfilePicture
);

// Admin Routes
router.get("/users", protect, admin, getUsers);
router.get("/users/:_id", protect, admin, getUserById);
router.put("/users/:_id", protect, admin, updateUser);
router.delete("/users/:_id", protect, admin, deleteUser);

export default router;
