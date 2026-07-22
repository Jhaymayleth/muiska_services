import { io } from "socket.io-client";
import { api } from "./api.js";

let socket = null;
let isConnected = false;
let messageCallbacks = [];
let typingCallbacks = [];
let readCallbacks = [];

export const chatService = {
  connect(token) {
    if (socket) {
      socket.disconnect();
    }

    socket = io(window.location.origin, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      isConnected = true;
      console.log("Chat connected");
    });

    socket.on("disconnect", () => {
      isConnected = false;
      console.log("Chat disconnected");
    });

    socket.on("new_message", (data) => {
      messageCallbacks.forEach((cb) => cb(data));
    });

    socket.on("user_typing", (data) => {
      typingCallbacks.forEach((cb) => cb(data));
    });

    socket.on("messages_read", (data) => {
      readCallbacks.forEach((cb) => cb(data));
    });

    socket.on("conversation_updated", (data) => {
      messageCallbacks.forEach((cb) => cb(data));
    });

    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      isConnected = false;
    }
  },

  joinConversation(conversationId) {
    if (socket && isConnected) {
      socket.emit("join_conversation", conversationId);
    }
  },

  sendMessage(conversationId, content) {
    if (socket && isConnected) {
      socket.emit("send_message", { conversationId, content });
    }
  },

  sendTyping(conversationId) {
    if (socket && isConnected) {
      socket.emit("typing", { conversationId });
    }
  },

  markRead(conversationId) {
    if (socket && isConnected) {
      socket.emit("mark_read", { conversationId });
    }
  },

  onMessage(callback) {
    messageCallbacks.push(callback);
    return () => {
      messageCallbacks = messageCallbacks.filter((cb) => cb !== callback);
    };
  },

  onTyping(callback) {
    typingCallbacks.push(callback);
    return () => {
      typingCallbacks = typingCallbacks.filter((cb) => cb !== callback);
    };
  },

  onRead(callback) {
    readCallbacks.push(callback);
    return () => {
      readCallbacks = readCallbacks.filter((cb) => cb !== callback);
    };
  },

  // REST API methods
  async getConversations() {
    return api.getConversations();
  },

  async getConversation(id) {
    return api.getConversation(id);
  },

  async getMessages(conversationId, params = {}) {
    return api.getMessages(conversationId, params);
  },

  async createConversation(publicationId, sellerId) {
    return api.createConversation(publicationId, sellerId);
  },

  async markMessagesRead(conversationId) {
    return api.markMessagesRead(conversationId);
  },
};
