import { pool } from "../config/database.js";

export const verificationService = {
  // Get pending verifications (for verifier)
  async getPendingVerifications() {
    const result = await pool.query(
      `SELECT v.*, u.name, u.email, u.user_type, u.phone, u.whatsapp, u.bio, u.profile_image_url,
              n.name as neighborhood_name, n.locality
       FROM verifications v
       JOIN users u ON v.user_id = u.id
       LEFT JOIN neighborhoods n ON u.neighborhood_id = n.id
       WHERE v.status = 'pending'
       ORDER BY v.created_at ASC`
    );
    return result.rows;
  },

  // Get user's verification status
  async getMyVerificationStatus(userId) {
    const result = await pool.query(
      `SELECT verification_status, rejection_reason, verified_at, is_verified_badge
       FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  // Approve verification
  async approveVerification(verificationId, verifierId, reason = "") {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const verifResult = await client.query(
        `UPDATE verifications 
         SET status = 'approved', verifier_id = $1, reason = $2
         WHERE id = $3 AND status = 'pending'
         RETURNING *`,
        [verifierId, reason, verificationId]
      );

      if (verifResult.rows.length === 0) {
        throw new Error("Verification not found or already processed");
      }

      const verification = verifResult.rows[0];

      await client.query(
        `UPDATE users 
         SET verification_status = 'approved', verified_by = $1, verified_at = NOW(), 
             is_verified_badge = TRUE, rejection_reason = NULL
         WHERE id = $2`,
        [verifierId, verification.user_id]
      );

      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ($1, 'verification_approved', $2, $3, $4)`,
        [
          verification.user_id,
          "Profile Verified!",
          "Your profile has been verified and approved. You can now create listings.",
          JSON.stringify({ verification_id: verificationId })
        ]
      );

      await client.query("COMMIT");
      return { success: true, verification };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Reject verification
  async rejectVerification(verificationId, verifierId, reason) {
    if (!reason || reason.trim() === "") {
      const error = new Error("Rejection reason is required");
      error.code = "MISSING_REASON";
      throw error;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const verifResult = await client.query(
        `UPDATE verifications 
         SET status = 'rejected', verifier_id = $1, reason = $2
         WHERE id = $3 AND status = 'pending'
         RETURNING *`,
        [verifierId, reason, verificationId]
      );

      if (verifResult.rows.length === 0) {
        throw new Error("Verification not found or already processed");
      }

      const verification = verifResult.rows[0];

      await client.query(
        `UPDATE users 
         SET verification_status = 'rejected', verified_by = $1, verified_at = NOW(),
             is_verified_badge = FALSE, rejection_reason = $2
         WHERE id = $3`,
        [verifierId, reason, verification.user_id]
      );

      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ($1, 'verification_rejected', $2, $3, $4)`,
        [
          verification.user_id,
          "Profile Not Verified",
          `Your profile was not verified: ${reason}. You can correct the information and try again.`,
          JSON.stringify({ verification_id: verificationId, reason })
        ]
      );

      await client.query("COMMIT");
      return { success: true, verification };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Create verification request (when seller completes profile)
  async createVerificationRequest(userId) {
    const result = await pool.query(
      `INSERT INTO verifications (user_id, status)
       VALUES ($1, 'pending')
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [userId]
    );
    return result.rows[0] || null;
  },

  async createPendingVerification(userId) {
    const result = await pool.query(
      `INSERT INTO verifications (user_id, status)
       VALUES ($1, 'pending')
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [userId]
    );
    return result.rows[0] || null;
  },

  // Get verification by ID (for detailed view)
  async getVerificationById(verificationId) {
    const result = await pool.query(
      `SELECT v.*, u.name, u.email, u.user_type, u.phone, u.whatsapp, u.bio, u.profile_image_url,
              n.name as neighborhood_name, n.locality
       FROM verifications v
       JOIN users u ON v.user_id = u.id
       LEFT JOIN neighborhoods n ON u.neighborhood_id = n.id
       WHERE v.id = $1`,
      [verificationId]
    );
    return result.rows[0] || null;
  },

  // Get user's verification history
  async getUserVerifications(userId) {
    const result = await pool.query(
      `SELECT v.*, u.name as verifier_name
       FROM verifications v
       LEFT JOIN users u ON v.verifier_id = u.id
       WHERE v.user_id = $1
       ORDER BY v.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get verifications by verifier
  async getVerificationsByVerifier(verifierId) {
    const result = await pool.query(
      `SELECT v.*, u.name, u.email, u.user_type, u.phone, u.whatsapp, u.bio, u.profile_image_url,
              n.name as neighborhood_name, n.locality
       FROM verifications v
       JOIN users u ON v.user_id = u.id
       LEFT JOIN neighborhoods n ON u.neighborhood_id = n.id
       WHERE v.verifier_id = $1
       ORDER BY v.created_at DESC`,
      [verifierId]
    );
    return result.rows;
  }
};