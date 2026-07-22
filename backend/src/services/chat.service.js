import { pool } from "../config/database.js";

export const chatService = {
  async createConversation({ publicationId, buyerId, sellerId }) {
    const result = await pool.query(
      `INSERT INTO conversations (publication_id, buyer_id, seller_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (publication_id, buyer_id, seller_id)
       DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [publicationId, buyerId, sellerId]
    );
    return result.rows[0];
  },

  async getConversations(userId) {
    const result = await pool.query(
      `SELECT c.id, c.publication_id, c.buyer_id, c.seller_id, c.created_at, c.updated_at,
              p.title as publication_title, p.images,
              u1.name as buyer_name, u1.profile_image_url as buyer_avatar,
              u2.name as seller_name, u2.profile_image_url as seller_avatar,
              m.content as last_message, m.created_at as last_message_at,
              (SELECT COUNT(*) FROM messages
               WHERE conversation_id = c.id AND is_read = FALSE AND sender_id != $1) as unread_count
       FROM conversations c
       LEFT JOIN publications p ON c.publication_id = p.id
       LEFT JOIN users u1 ON c.buyer_id = u1.id
       LEFT JOIN users u2 ON c.seller_id = u2.id
       LEFT JOIN messages m ON m.id = (
         SELECT id FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC LIMIT 1
       )
       WHERE c.buyer_id = $1 OR c.seller_id = $1
       ORDER BY c.updated_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async getConversationById(conversationId, userId) {
    const result = await pool.query(
      `SELECT c.id, c.publication_id, c.buyer_id, c.seller_id, c.created_at, c.updated_at,
              p.title as publication_title, p.images,
              u1.name as buyer_name, u1.profile_image_url as buyer_avatar,
              u2.name as seller_name, u2.profile_image_url as seller_avatar
       FROM conversations c
       LEFT JOIN publications p ON c.publication_id = p.id
       LEFT JOIN users u1 ON c.buyer_id = u1.id
       LEFT JOIN users u2 ON c.seller_id = u2.id
       WHERE c.id = $1 AND (c.buyer_id = $2 OR c.seller_id = $2)`,
      [conversationId, userId]
    );
    return result.rows[0] || null;
  },

  async getMessages(conversationId, userId, { limit = 50, offset = 0 } = {}) {
    const conv = await this.getConversationById(conversationId, userId);
    if (!conv) {
      const error = new Error("Conversation not found");
      error.code = "NOT_FOUND";
      throw error;
    }

    const result = await pool.query(
      `SELECT id, conversation_id, sender_id, content, is_read, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );

    await pool.query(
      `UPDATE messages SET is_read = TRUE
       WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE`,
      [conversationId, userId]
    );

    return result.rows.reverse();
  },

  async sendMessage({ conversationId, senderId, content }) {
    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, conversation_id, sender_id, content, is_read, created_at`,
      [conversationId, senderId, content]
    );

    await pool.query(
      `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
      [conversationId]
    );

    return result.rows[0];
  },

  async getUnreadCount(userId) {
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE (c.buyer_id = $1 OR c.seller_id = $1)
         AND m.sender_id != $1
         AND m.is_read = FALSE`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  async markMessagesRead(conversationId, userId) {
    await pool.query(
      `UPDATE messages SET is_read = TRUE
       WHERE conversation_id = $1 AND sender_id != $2`,
      [conversationId, userId]
    );
  },
};
