// Middleware para verificar roles de usuario
// Uso: requireRole('admin') o requireRole('admin', 'moderator')

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // El usuario debe estar autenticado (auth.middleware.js ya lo puso en req.user)
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    // Verificar si el rol del usuario está en los permitidos
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Sin permisos suficientes" });
    }

    next();
  };
}

// Alias común para solo admins
export const requireAdmin = requireRole("admin");