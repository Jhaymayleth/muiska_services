import { Router } from "express";
import {
  toggleFavorite,
  getMyFavorites,
  checkFavorite,
} from "../controllers/favorite.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// POST /api/favorites/:publicationId/toggle - Agregar/quitar favorito
router.post("/:publicationId/toggle", toggleFavorite);

// GET /api/favorites - Listar mis favoritos (paginado)
router.get("/", getMyFavorites);

// GET /api/favorites/:publicationId/check - Verificar si es favorito
router.get("/:publicationId/check", checkFavorite);

export default router;