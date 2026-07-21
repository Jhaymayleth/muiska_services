// Middleware para requerir vendedor verificado (para crear publicaciones)
export const requireVerifiedSeller = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  // Admin y verificador pueden crear publicaciones (para testing/admin)
  if (req.user.role === "admin" || req.user.role === "verificador") {
    return next();
  }

  // Solo vendedores verificados
  if (req.user.tipo_usuario !== "vendedor") {
    return res.status(403).json({ 
      message: "Solo los vendedores pueden crear publicaciones",
      code: "NOT_SELLER"
    });
  }

  if (req.user.estado_verificacion !== "aprobado") {
    return res.status(403).json({ 
      message: "Tu perfil está en verificación. No puedes crear publicaciones hasta que sea aprobado.",
      code: "NOT_VERIFIED",
      estado: req.user.estado_verificacion,
      motivo: req.user.motivo_rechazo_verificacion
    });
  }

  if (!req.user.badge_verificado) {
    return res.status(403).json({ 
      message: "Tu perfil no está verificado",
      code: "NOT_VERIFIED"
    });
  }

  next();
};