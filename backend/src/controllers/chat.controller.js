import { chatService } from "../services/chat.service.js";

export const chatController = {
  async createConversation(req, res, next) {
    try {
      const { publicationId, sellerId } = req.body;
      if (!publicationId || !sellerId) {
        return res.status(400).json({ message: "publicationId and sellerId are required" });
      }
      if (sellerId === req.user.id) {
        return res.status(400).json({ message: "Cannot create conversation with yourself" });
      }
      const conversation = await chatService.createConversation({
        publicationId,
        buyerId: req.user.id,
        sellerId,
      });
      res.status(201).json({ conversation });
    } catch (error) {
      next(error);
    }
  },

  async getConversations(req, res, next) {
    try {
      const conversations = await chatService.getConversations(req.user.id);
      const unreadCount = await chatService.getUnreadCount(req.user.id);
      res.json({ conversations, unreadCount });
    } catch (error) {
      next(error);
    }
  },

  async getConversation(req, res, next) {
    try {
      const { id } = req.params;
      const conversation = await chatService.getConversationById(id, req.user.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json({ conversation });
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req, res, next) {
    try {
      const { id } = req.params;
      const { limit, offset } = req.query;
      const messages = await chatService.getMessages(id, req.user.id, {
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });
      res.json({ messages });
    } catch (error) {
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Content is required" });
      }
      const message = await chatService.sendMessage({
        conversationId: id,
        senderId: req.user.id,
        content: content.trim(),
      });
      res.status(201).json({ message });
    } catch (error) {
      next(error);
    }
  },

  async markRead(req, res, next) {
    try {
      const { id } = req.params;
      await chatService.markMessagesRead(id, req.user.id);
      res.json({ message: "Messages marked as read" });
    } catch (error) {
      next(error);
    }
  },
};
