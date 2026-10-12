
import { ConversationService } from "../services/conversation.service.js";
import type { AuthRequest } from "../types/index.js";
import type { NextFunction, Response } from "express";
import { AppError } from "../middleware/errorHandler.js";

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversations = await ConversationService.listConversations(userId);
    return res.status(200).json({
      success: true,
      message: "Conversations retrieved successfully",
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve conversations",
    });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const conversationId = req.params.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const messages = await ConversationService.getMessages(conversationId, userId, { limit });
    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve messages",
    });
  }
};

export const createDirectConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const toUserId = req.body.toUserId;
    if (!userId || !toUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversation = await ConversationService.createDirectConversation(userId, toUserId);
    return res.status(200).json({
      success: true,
      message: "Conversation created successfully",
      data: conversation,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
};

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const payload =
      typeof req.body?.message === "string"
        ? { content: req.body.message }
        : req.body?.message || req.body;

    if (!payload?.content && typeof req.body?.message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty",
      });
    }

    // Pass (conversationId, userId, payload) in correct order
    const sentMessage = await ConversationService.createMessage(
      conversationId,
      userId,
      payload,
    );

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: sentMessage,
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};

export const readMessage = async (req:AuthRequest, res:Response, next:NextFunction)=>{
  try{
    const userId = req.user?.id;
    const conversationId = req.params.id;
    if (!userId || !conversationId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversation = await ConversationService.updateReadPosition(
      conversationId,
      userId,
    );
    return res.status(200).json({
      success: true,
      message: "Message read successfully",
      data: conversation,
    });
  }
  catch(err){
    console.error("Error reading message:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to read message",
    });
  }
}

/**
 * Upload a chat attachment (image or file) to Cloudinary and persist it as a
 * message. Requires multipart/form-data with a "file" field.
 */
export const sendAttachment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    if (!req.file) {
      throw new AppError(
        'No file provided. Please attach an image or document using the "file" field.',
        400,
        "NO_FILE_PROVIDED",
      );
    }

    const caption =
      typeof req.body?.caption === "string" ? req.body.caption : undefined;

    const message = await ConversationService.createAttachmentMessage(
      conversationId,
      userId,
      {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      { caption },
    );

    return res.status(201).json({
      success: true,
      message: "Attachment sent successfully",
      data: message,
    });
  } catch (error: any) {
    console.error("Error sending attachment:", error);
    if (error instanceof AppError) {
      return next(error);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send attachment",
    });
  }
};
