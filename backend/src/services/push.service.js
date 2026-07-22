import webPush from "web-push";
import { pool } from "../config/database.js";

const vapidKeys = webPush.generateVAPIDKeys();
webPush.setVapidDetails(
  "mailto:muiska@localhost",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const pushService = {
  getPublicKey() {
    return vapidKeys.publicKey;
  },

  async subscribe(userId, { endpoint, p256dh, auth }) {
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, endpoint)
       DO UPDATE SET p256dh = $3, auth = $4`,
      [userId, endpoint, p256dh, auth]
    );
  },

  async unsubscribe(userId, endpoint) {
    await pool.query(
      `DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2`,
      [userId, endpoint]
    );
  },

  async getSubscriptions(userId) {
    const result = await pool.query(
      `SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  },

  async sendToUser(userId, { title, message, url }) {
    const subs = await this.getSubscriptions(userId);
    const payload = JSON.stringify({ title, message, url });

    for (const sub of subs) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
      } catch (err) {
        if (err.statusCode === 410) {
          await this.unsubscribe(userId, sub.endpoint);
        }
      }
    }
  },
};
