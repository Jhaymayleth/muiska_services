import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { chatService } from "../services/chat.service.js";

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: config.cors.origin },
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    socket.on("join_conversation", async (conversationId) => {
      const conv = await chatService.getConversationById(conversationId, userId);
      if (conv) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("send_message", async (data) => {
      const { conversationId, content } = data;
      if (!conversationId || !content?.trim()) return;

      try {
        const message = await chatService.sendMessage({
          conversationId,
          senderId: userId,
          content: content.trim(),
        });

        io.to(`conversation:${conversationId}`).emit("new_message", {
          conversationId,
          message,
        });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("typing", (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit("user_typing", {
        conversationId,
        userId,
      });
    });

    socket.on("mark_read", async (data) => {
      const { conversationId } = data;
      if (!conversationId) return;

      await chatService.markMessagesRead(conversationId, userId);
      io.to(`conversation:${conversationId}`).emit("messages_read", {
        conversationId,
        userId,
      });
    });

    socket.on("disconnect", () => {
      // cleanup if needed
    });
  });

  return io;
}
