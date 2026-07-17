import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/category.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/categories", getAll);
router.get("/categories/:id", getById);
router.post("/categories", verifyToken, create);
router.put("/categories/:id", verifyToken, update);
router.delete("/categories/:id", verifyToken, remove);

export default router;
