import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/category.controller.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/categories", getAll);
router.get("/categories/:id", getById);
router.post("/categories", verifyToken, requireAdmin, create);
router.put("/categories/:id", verifyToken, requireAdmin, update);
router.delete("/categories/:id", verifyToken, requireAdmin, remove);

export default router;
