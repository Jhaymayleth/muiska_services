import { Router } from "express";
import { deleteUser, getUsers, updateUser } from "../controllers/admin.controller.js";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use("/admin", verifyToken, requireAdmin);
router.get("/admin/users", getUsers);
router.patch("/admin/users/:id", updateUser);
router.delete("/admin/users/:id", deleteUser);

export default router;
