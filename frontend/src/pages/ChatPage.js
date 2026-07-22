import { loadTemplate } from "../utils/templateLoader.js";
import { getUser } from "../utils/auth.js";
import { chatService } from "../services/chat.service.js";
import { sessionStore } from "../state/session.store.js";
import { navigateTo } from "../router/router.js";

const ChatPage = async () => {
  const template = loadTemplate("ChatPage");
  const section = document.createElement("section");
  section.className = "mx-auto max-w-6xl px-4 py-8";
  section.innerHTML = template;

  const user = getUser();
  const conversationsList = section.querySelector("#conversations-list");
  const messagesContainer = section.querySelector("#messages-container");
  const chatInputArea = section.querySelector("#chat-input-area");
  const chatHeader = section.querySelector("#chat-header");
  const messageInput = section.querySelector("#message-input");
  const sendBtn = section.querySelector("#send-btn");
  const backBtn = section.querySelector("#back-btn");

  let currentConversationId = null;
  let conversations = [];

  backBtn.addEventListener("click", () => {
    navigateTo("/dashboard");
  });

  const loadConversations = async () => {
    try {
      const res = await chatService.getConversations();
      conversations = res.conversations || [];
      renderConversations(conversations);
    } catch (err) {
      conversationsList.innerHTML = '<p class="p-4 text-sm text-red-600">Error loading conversations</p>';
    }
  };

  const renderConversations = (convs) => {
    if (convs.length === 0) {
      conversationsList.innerHTML = '<p class="p-4 text-sm text-gray-500">No conversations yet</p>';
      return;
    }
    conversationsList.innerHTML = convs
      .map((c) => {
        const isBuyer = c.buyer_id === user.id;
        const otherUser = isBuyer ? c.seller_name : c.buyer_name;
        const otherAvatar = isBuyer ? c.seller_avatar : c.buyer_avatar;
        const unread = c.unread_count || 0;
        const isActive = c.id === currentConversationId;

        return `
          <div
            class="cursor-pointer border-b border-gray-100 p-3 hover:bg-gray-50 ${isActive ? "bg-primary/5" : ""}"
            data-conversation-id="${c.id}"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                ${otherAvatar ? `<img src="${otherAvatar}" alt="${otherUser}" class="h-10 w-10 object-cover" />` : `<span class="text-sm font-bold text-gray-500">${otherUser?.[0] || "?"}</span>`}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-sm">${otherUser || "Unknown"}</span>
                  <span class="text-xs text-gray-400">${formatTimeAgo(c.last_message_at)}</span>
                </div>
                <p class="text-xs text-gray-600 line-clamp-1">${c.last_message || "No messages yet"}</p>
              </div>
              ${unread > 0 ? `<span class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-xs font-bold text-white">${unread}</span>` : ""}
            </div>
          </div>
        `;
      })
      .join("");

    conversationsList.querySelectorAll("[data-conversation-id]").forEach((el) => {
      el.addEventListener("click", () => openConversation(el.dataset.conversationId));
    });
  };

  const openConversation = async (conversationId) => {
    currentConversationId = conversationId;
    chatService.joinConversation(conversationId);
    chatService.markMessagesRead(conversationId);

    renderConversations(conversations);

    chatHeader.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200">
          <span class="text-sm font-bold text-gray-500">?</span>
        </div>
        <div>
          <h2 class="font-semibold text-gray-900">Loading...</h2>
          <p class="text-xs text-gray-400">Online</p>
        </div>
      </div>
    `;

    chatInputArea.classList.remove("hidden");
    messagesContainer.innerHTML = '<p class="p-4 text-center text-sm text-gray-500">Loading messages...</p>';

    try {
      const res = await chatService.getConversation(conversationId);
      const conv = res.conversation;
      const isBuyer = conv.buyer_id === user.id;
      const otherUser = isBuyer ? conv.seller_name : conv.buyer_name;
      const otherAvatar = isBuyer ? conv.seller_avatar : conv.buyer_avatar;

      chatHeader.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200">
            ${otherAvatar ? `<img src="${otherAvatar}" alt="${otherUser}" class="h-10 w-10 object-cover" />` : `<span class="text-sm font-bold text-gray-500">${otherUser?.[0] || "?"}</span>`}
          </div>
          <div>
            <h2 class="font-semibold text-gray-900">${otherUser || "Unknown"}</h2>
            <p class="text-xs text-gray-400">Online</p>
          </div>
        </div>
      `;
    } catch (err) {
      console.error("Error loading conversation:", err);
    }

    await loadMessages(conversationId);
  };

  const loadMessages = async (conversationId) => {
    try {
      const res = await chatService.getMessages(conversationId, { limit: 50 });
      const msgs = res.messages || [];
      renderMessages(msgs);
    } catch (err) {
      messagesContainer.innerHTML = '<p class="p-4 text-center text-sm text-red-600">Error loading messages</p>';
    }
  };

  const renderMessages = (msgs) => {
    if (msgs.length === 0) {
      messagesContainer.innerHTML = '<p class="p-4 text-center text-sm text-gray-400">No messages yet. Start the conversation!</p>';
      return;
    }
    messagesContainer.innerHTML = msgs
      .map((m) => {
        const isOwn = m.sender_id === user.id;
        return `
          <div class="mb-3 flex ${isOwn ? "justify-end" : "justify-start"}">
            <div class="max-w-[70%] rounded-lg px-4 py-2 ${isOwn ? "bg-primary text-white" : "bg-gray-100 text-gray-900"}">
              <p class="text-sm">${escapeHtml(m.content)}</p>
              <p class="text-xs opacity-70 mt-1">${formatTime(m.created_at)}</p>
            </div>
          </div>
        `;
      })
      .join("");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  sendBtn.addEventListener("click", async () => {
    const content = messageInput.value.trim();
    if (!content || !currentConversationId) return;

    chatService.sendMessage(currentConversationId, content);
    messageInput.value = "";
  });

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });

  messageInput.addEventListener("input", () => {
    if (currentConversationId) {
      chatService.sendTyping(currentConversationId);
    }
  });

  chatService.onMessage((data) => {
    if (data.conversationId === currentConversationId) {
      const msg = data.message;
      const isOwn = msg.sender_id === user.id;
      const msgEl = document.createElement("div");
      msgEl.className = "mb-3 flex " + (isOwn ? "justify-end" : "justify-start");
      msgEl.innerHTML = `
        <div class="max-w-[70%] rounded-lg px-4 py-2 ${isOwn ? "bg-primary text-white" : "bg-gray-100 text-gray-900"}">
          <p class="text-sm">${escapeHtml(msg.content)}</p>
          <p class="text-xs opacity-70 mt-1">${formatTime(msg.created_at)}</p>
        </div>
      `;
      messagesContainer.appendChild(msgEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    loadConversations();
  });

  window.addEventListener("open-conversation", (e) => {
    const { conversationId } = e.detail;
    if (conversationId) {
      openConversation(conversationId);
    }
  });

  chatService.onTyping((data) => {
    if (data.conversationId === currentConversationId) {
      const typingEl = document.createElement("div");
      typingEl.className = "text-xs text-gray-400 italic mb-2";
      typingEl.textContent = "Someone is typing...";
      typingEl.id = "typing-indicator";
      messagesContainer.appendChild(typingEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      setTimeout(() => {
        const el = document.getElementById("typing-indicator");
        if (el) el.remove();
      }, 2000);
    }
  });

  const token = sessionStore.getToken();
  if (token) {
    chatService.connect(token);
  }

  await loadConversations();

  const pathParts = window.location.pathname.split("/");
  const pathConvId = pathParts[pathParts.length - 1];
  if (pathConvId && pathConvId !== "chat" && pathConvId.length > 20) {
    openConversation(pathConvId);
  }

  return section;
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

export default ChatPage;
