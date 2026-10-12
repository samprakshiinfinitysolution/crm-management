import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {
  createDirectConversation,
  getConversation,
  getMessages,
  sendMessage,
  readMessage,
  sendAttachment,
} from "../controllers/conversation.controller.js";
import { uploadChatAttachment } from "../middleware/upload.middleware.js";

const conversationRouter = Router();

// Ensure all conversation routes require authentication
conversationRouter.use(authenticateUser);

/**
 * @route   GET /api/conversations
 * @desc    List conversations with last message and unread count
 * @access  Private
 */
conversationRouter.get("/", getConversation);

/**
 * @route   POST /api/conversations/direct
 * @desc    Create or retrieve a direct conversation
 * @access  Private
 */
conversationRouter.post("/direct", createDirectConversation);

/**
 * @route   GET /api/conversations/:id/messages
 * @desc    Fetch messages for conversation
 * @access  Private
 */
conversationRouter.get("/:id/messages", getMessages);

/**
 * @route   POST /api/conversations/:id/messages
 * @desc    Persist a message
 * @access  Private
 */
conversationRouter.post("/:id/messages", sendMessage);

/**
 * @route   POST /api/conversations/:id/attachments
 * @desc    Upload an image/file attachment (Cloudinary) and persist it as a message
 * @access  Private
 */
conversationRouter.post(
  "/:id/attachments",
  uploadChatAttachment.single("file"),
  sendAttachment,
);


/**
 * @route   PATCH /api/conversations/:id/read
 * @desc    Update the user's read position
 * @access  Private
 */
conversationRouter.patch("/:id/read", readMessage);

/**
 * @route   PATCH /api/conversations/:id/archive
 * @desc    Archive for the current user
 * @access  Private
 */
conversationRouter.patch("/:id/archive", (req, res) => {
  // Handler implementation in controller
});

/**
 * @route   PATCH /api/conversations/:id/mute
 * @desc    Mute notifications for the current user
 * @access  Private
 */
conversationRouter.patch("/:id/mute", (req, res) => {
  // Handler implementation in controller
});

export default conversationRouter;
