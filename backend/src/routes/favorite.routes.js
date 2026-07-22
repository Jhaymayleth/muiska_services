import { Router } from "express";
import {
  toggleFavorite,
  getMyFavorites,
  checkFavorite,
} from "../controllers/favorite.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

router.use(verifyToken);

const publicationIdParamSchema = z.object({
  publicationId: z.string().uuid("Invalid publication ID"),
});

const favoritesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

router.post("/:publicationId/toggle", validateParams(publicationIdParamSchema), toggleFavorite);
router.get("/", validateQuery(favoritesQuerySchema), getMyFavorites);
router.get("/:publicationId/check", validateParams(publicationIdParamSchema), checkFavorite);

export default router;