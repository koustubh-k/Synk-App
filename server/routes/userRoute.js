import express from "express";
import {
  allUsers,
  getUserProfile,
  uploadAvatar,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public route to get all users
router.route("/").get(allUsers);

// Protected route to get a user's profile
router.route("/profile").get(protect, getUserProfile);

// Protected route to upload avatar
router.route("/avatar").post(protect, upload.single("avatar"), uploadAvatar);

export default router;
