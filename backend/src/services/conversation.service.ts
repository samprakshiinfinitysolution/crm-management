import { ConversationType, MessageType } from "@prisma/client";
import { prisma } from "../config/db.js";
import { z } from "zod";
import { emitToUser } from "../config/socket.js";
import { CloudinaryService } from "./cloudinary.service.js";

export const sendSchema = z.object({
  content: z
    .string({ required_error: "Message content is required" })
    .trim()
    .min(1, "Message content cannot be empty")
    .max(10000, "Message content cannot exceed 10,000 characters"),
  toUserId: z
    .string()
    .trim()
    .min(1, "Recipient user ID cannot be empty")
    .optional(),
  type: z
    .nativeEnum(MessageType, {
      errorMap: () => ({ message: "Invalid message type" }),
    })
    .default(MessageType.TEXT)
    .optional(),
});

export const sendMessageSchema = sendSchema;
export type SendMessageInput = z.infer<typeof sendSchema>;

export class ConversationService {
  /**
   * List conversations for the user with last message and unread count
   */
  static async listConversations(
    userId: string,
    query?: { limit?: number; cursor?: string },
  ) {
    // Boilerplate - implementation to follow
    try {
      const limit = query?.limit || 10;
      const cursor = query?.cursor;
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
        take: limit,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          participants: {
            include: {
              // Expose only safe profile fields; never leak passwordHash or secrets
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  isActive: true,
                },
              },
            },
          },
          messages: { take: 1, orderBy: { createdAt: "desc" } },
        },
      });
      return conversations;
    } catch (error) {
      console.error("Error listing conversations:", error);
    }
    return [];
  }

  /**
   * Create or retrieve a direct conversation between two users
   */
  static async getOrCreateDirectConversation(
    userId: string,
    targetUserId: string,
  ) {
    // Boilerplate - implementation to follow
    return null;
  }

  /**
   * Persist a new message to a conversation
   */
  static async createMessage(
    conversationId: string,
    senderId: string,
    payload: { content: string; type?: string } | string,
  ) {
    try {
      const rawPayload =
        typeof payload === "string" ? { content: payload } : payload;
      const { content, type } = sendSchema.parse(rawPayload);

      // Verify conversation exists and user is a participant
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: true },
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const isParticipant = conversation.participants.some(
        (p) => p.userId === senderId,
      );
      if (!isParticipant) {
        throw new Error("User is not a participant of this conversation");
      }

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId,
          content,
          type: (type as MessageType) || MessageType.TEXT,
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // Update conversation updatedAt timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // Safely emit to conversation participants
      try {
        for (const participant of conversation.participants) {
          if (participant.userId !== senderId) {
            emitToUser(participant.userId, "message", message);
            emitToUser(participant.userId, "message:new", message);
          }
        }
      } catch (socketError) {
        console.warn("Socket emission warning:", socketError);
      }

      return message;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  /**
   * Create an attachment message (image or file) backed by Cloudinary storage.
   *
   * The attachment metadata is persisted as a JSON string in `content`
   * (no schema migration required) so it can be read back by the client.
   */
  static async createAttachmentMessage(
    conversationId: string,
    senderId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    options: { caption?: string } = {},
  ) {
    try {
      // Verify conversation exists and user is a participant
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: true },
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const isParticipant = conversation.participants.some(
        (p) => p.userId === senderId,
      );
      if (!isParticipant) {
        throw new Error("User is not a participant of this conversation");
      }

      // Upload to Cloudinary (server-side; secret never leaves the backend)
      const upload = await CloudinaryService.uploadBuffer(file.buffer, {
        originalName: file.originalname,
      });

      const isImage = (file.mimetype || "").toLowerCase().startsWith("image/");
      const type = isImage ? MessageType.IMAGE : MessageType.FILE;

      const attachment = {
        url: upload.secureUrl,
        publicId: upload.publicId,
        resourceType: upload.resourceType,
        format: upload.format,
        bytes: upload.bytes ?? file.size,
        width: upload.width,
        height: upload.height,
        fileName: file.originalname,
        mimeType: file.mimetype,
        caption: options.caption?.trim() || undefined,
      };

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId,
          content: JSON.stringify(attachment),
          type,
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // Update conversation updatedAt timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // Safely emit to conversation participants
      try {
        for (const participant of conversation.participants) {
          if (participant.userId !== senderId) {
            emitToUser(participant.userId, "message", message);
            emitToUser(participant.userId, "message:new", message);
          }
        }
      } catch (socketError) {
        console.warn("Socket emission warning:", socketError);
      }

      return message;
    } catch (error) {
      console.error("Error creating attachment message:", error);
      throw error;
    }
  }

  /**
   * Fetch messages for a conversation using cursor pagination
   */
  static async getMessages(
    conversationId: string,
    userId: string,
    params?: { cursor?: string; limit?: number },
  ) {
    // Boilerplate - implementation to follow
    try {
      const limit = params?.limit || 100;
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          participants: true,
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            take: limit,
            include: {
              sender: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const isParticipant = conversation.participants.some(
        (p) => p.userId === userId,
      );
      if (!isParticipant) {
        throw new Error("User is not a participant of this conversation");
      }

      return conversation.messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  static async createDirectConversation(userId: string, targetUserId: string) {
    try {
      // First try to find an existing direct conversation between these two users
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: ConversationType.DIRECT,
          participants: {
            every: {
              userId: { in: [userId, targetUserId] },
            },
            some: { userId: userId }, // Ensure both are participants
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      });

      // If found, return it immediately
      if (existingConversation) {
        console.log(
          "Found existing direct conversation:",
          existingConversation.id,
        );
        return existingConversation;
      }

      // Otherwise, create a new direct conversation
      console.log(
        "Creating new direct conversation between",
        userId,
        "and",
        targetUserId,
      );

      const conversation = await prisma.conversation.create({
        data: {
          type: ConversationType.DIRECT,
          participants: {
            create: [
              {
                userId: userId,
              },
              {
                userId: targetUserId,
              },
            ],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      });

      console.log("Created direct conversation with ID:", conversation.id);
      return conversation;
    } catch (error) {
      console.error("Error creating direct conversation:", error);
      throw error;
    }
  }

  /**
   * Update the user's read position (lastReadAt) for a conversation
   */
  static async updateReadPosition(conversationId: string, userId: string) {
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });
    return { success: true };
  }

  /**
   * Archive / unarchive conversation for current user
   */
  static async archiveConversation(
    conversationId: string,
    userId: string,
    isArchived: boolean = true,
  ) {
    // Boilerplate - implementation to follow
    return { success: true, isArchived };
  }

  /**
   * Mute / unmute conversation notifications for current user
   */
  static async muteConversation(
    conversationId: string,
    userId: string,
    isMuted: boolean = true,
  ) {
    // Boilerplate - implementation to follow
    return { success: true, isMuted };
  }
}
