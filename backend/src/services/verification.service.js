import { pool } from "../config/database.js";

export const verificationService = {
  // Obtener solicitudes de verificación pendientes (para verificador)
  async getPendingVerifications() {
    const result = await pool.query(
      `SELECT v.*, u.name, u.email, u.tipo_usuario, u.telefono, u.whatsapp, u.bio, u.foto_perfil_url,
              b.nombre as barrio_nombre, b.localidad
       FROM verificaciones v
       JOIN users u ON v.usuario_id = u.id
       LEFT JOIN barrios b ON u.barrio_id = b.id
       WHERE v.estado = 'pendiente'
       ORDER BY v.creado_en ASC`
    );
    return result.rows;
  },

  // Aprobar verificación
  async approveVerification(verificationId, verificadorId, motivo = "") {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Actualizar verificación
      const verifResult = await client.query(
        `UPDATE verificaciones 
         SET estado = 'aprobado', verificador_id = $1, motivo = $2
         WHERE id = $3 AND estado = 'pendiente'
         RETURNING *`,
        [verificadorId, motivo, verificationId]
      );

      if (verifResult.rows.length === 0) {
        throw new Error("Verificación no encontrada o ya procesada");
      }

      const verificacion = verifResult.rows[0];

      // Actualizar usuario
      await client.query(
        `UPDATE users 
         SET estado_verificacion = 'aprobado', verificado_por = $1, verificado_en = NOW(), 
             badge_verificado = TRUE, motivo_rechazo_verificacion = NULL
         WHERE id = $2`,
        [verificadorId, verificacion.usuario_id]
      );

      // Crear notificación
      await client.query(
        `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos)
         VALUES ($1, 'verificacion_aprobada', $2, $3, $4)`,
        [
          verificacion.usuario_id,
          "¡Perfil verificado!",
          "Tu perfil ha sido verificado y aprobado. Ya puedes crear publicaciones.",
          JSON.stringify({ verificacion_id: verificationId })
        ]
      );

      await client.query("COMMIT");
      return { success: true, verification: verificacion };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Rechazar verificación
  async rejectVerification(verificationId, verificadorId, motivo) {
    if (!motivo || motivo.trim() === "") {
      const error = new Error("El motivo de rechazo es obligatorio");
      error.code = "MISSING_REASON";
      throw error;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const verifResult = await client.query(
        `UPDATE verificaciones 
         SET estado = 'rechazado', verificador_id = $1, motivo = $2
         WHERE id = $3 AND estado = 'pendiente'
         RETURNING *`,
        [verificadorId, motivo, verificationId]
      );

      if (verifResult.rows.length === 0) {
        throw new Error("Verificación no encontrada o ya procesada");
      }

      const verificacion = verifResult.rows[0];

      await client.query(
        `UPDATE users 
         SET estado_verificacion = 'rechazado', verificado_por = $1, verificado_en = NOW(),
             badge_verificado = FALSE, motivo_rechazo_verificacion = $2
         WHERE id = $3`,
        [verificadorId, motivo, verificacion.usuario_id]
      );

      await client.query(
        `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos)
         VALUES ($1, 'verificacion_rechazada', $2, $3, $4)`,
        [
          verificacion.usuario_id,
          "Perfil no verificado",
          `Tu perfil no fue verificado: ${motivo}. Puedes corregir la información e intentarlo de nuevo.`,
          JSON.stringify({ verificacion_id: verificationId, motivo })
        ]
      );

      await client.query("COMMIT");
      return { success: true, verification: verificacion };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Crear solicitud de verificación (cuando vendedor completa perfil)
  async createVerificationRequest(usuarioId) {
    const result = await pool.query(
      `INSERT INTO verificaciones (usuario_id, estado)
       VALUES ($1, 'pendiente')
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [usuarioId]
    );
    return result.rows[0] || null;
  },

  async createPendingVerification(usuarioId) {
    const result = await pool.query(
      `INSERT INTO verificaciones (usuario_id, estado)
       VALUES ($1, 'pendiente')
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [usuarioId]
    );
    return result.rows[0] || null;
  },

  // Obtener historial de verificaciones de un usuario
  async getUserVerifications(usuarioId) {
    const result = await pool.query(
      `SELECT v.*, u.name as verificador_nombre
       FROM verificaciones v
       LEFT JOIN users u ON v.verificador_id = u.id
       WHERE v.usuario_id = $1
       ORDER BY v.creado_en DESC`,
      [usuarioId]
    );
    return result.rows;
  }
};