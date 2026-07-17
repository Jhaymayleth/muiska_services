// Middleware para rutas no encontradas (404)
export const notFoundMiddleware = (_req, res, _next) => {
  res.status(404).json({ message: "Recurso no encontrado" });
};