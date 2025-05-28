import multer from "multer";
import path from "path";
import fs from "fs";

// Create upload directories
const uploadDir = path.resolve("uploads");
const profilePicturesDir = path.resolve("uploads/profile-pictures");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir, { recursive: true });
}

// General storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

// Profile picture specific storage
const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profilePicturesDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.user?._id || req.user?.id || Date.now();
    cb(null, `profile-${userId}-${Date.now()}${ext}`);
  },
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const isValid =
    allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
    allowedTypes.test(file.mimetype);

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("Only images (jpeg, jpg, png, gif, webp) are allowed"), false);
  }
};

// General upload configuration
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB for products
});

// Profile picture upload configuration
const profilePictureUpload = multer({
  storage: profilePictureStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for profile pictures
});

// Utility function to delete old files
export const deleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
  return false;
};

// Utility function to get full file path
export const getFullFilePath = (relativePath) => {
  if (!relativePath) return null;
  return path.resolve(relativePath.startsWith('/') ? relativePath.slice(1) : relativePath);
};

export default upload;
export { profilePictureUpload };
