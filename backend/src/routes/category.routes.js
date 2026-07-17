import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/category.controller.js";
import { verifyToken, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/categories", getAll);
router.get("/categories/:id", getById);
router.post("/categories", verifyToken, requireRole("admin"), create);
router.put("/categories/:id", verifyToken, requireRole("admin"), update);
router.delete("/categories/:id", verifyToken, requireRole("admin"), remove);

export default router;
