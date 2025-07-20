import express from "express";
import {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  getOptimizedImage,
} from "../controllers/uploadController.js";
import upload from "../middleware/upload.js";
import { sellerAuth } from "../middleware/sellerAuth.js";

const uploadRouter = express.Router();

// Upload single image (seller only)
uploadRouter.post("/single", sellerAuth, upload.single("image"), uploadImage);

// Upload multiple images (seller only)
uploadRouter.post(
  "/multiple",
  sellerAuth,
  upload.array("images", 5),
  uploadMultipleImages
);

// Delete image (seller only)
uploadRouter.delete("/:publicId", sellerAuth, deleteImage);

// Get optimized image URL (public)
uploadRouter.get("/optimize", getOptimizedImage);

export default uploadRouter;
