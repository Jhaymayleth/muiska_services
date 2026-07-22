import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/category.controller.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import { z } from "zod";
import { createCategorySchema, updateCategorySchema } from "../validators/schemas.js";

const router = Router();

const idParamSchema = z.object({
  id: z.string().uuid("Invalid category ID"),
});

router.get("/categories", getAll);
router.get("/categories/:id", validateParams(idParamSchema), getById);
router.post("/categories", verifyToken, requireAdmin, validateBody(createCategorySchema), create);
router.put("/categories/:id", verifyToken, requireAdmin, validateParams(idParamSchema), validateBody(updateCategorySchema), update);
router.delete("/categories/:id", verifyToken, requireAdmin, validateParams(idParamSchema), remove);

export default router;