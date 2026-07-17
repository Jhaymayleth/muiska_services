import jwt from "jsonwebtoken";

// Verifica el token JWT y guarda el usuario en req.user
export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  // Si no hay token o no empieza con "Bearer "
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  // Extraer solo el token (quitar "Bearer ")
  const token = header.split(" ")[1];

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mi_secreto_jwt");
    req.user = decoded; // Guardar datos del usuario en la request
    next(); // Continuar al siguiente middleware o controlador
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// Middleware para verificar roles (solo admin por ahora)
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Si no hay usuario (no pasó verifyToken)
    if (!req.user) {
      return res.status(401).json({ message: "Token requerido" });
    }

    // Si el rol no está en la lista permitida
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permisos para acceder" });
    }

    next(); // El usuario tiene el rol correcto, continuar
  };
};