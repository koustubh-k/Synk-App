import express from "express";
import {
  accessChat,
  fetchChats,
  sendMessage,
  allMessages,
  sendAIMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);

router.route("/message").post(protect, sendMessage);
router.route("/message/:chatId").get(protect, allMessages);

// New route for AI chatbot messages
router.route("/ai/message").post(protect, sendAIMessage);

export default router;
