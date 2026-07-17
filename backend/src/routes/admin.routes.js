import { Router } from "express";
import {
  deleteUser,
  getUsers,
  updateUser,
  getPublications,
  updatePublication,
  deletePublication,
} from "../controllers/admin.controller.js";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use("/admin", verifyToken, requireAdmin);
router.get("/admin/users", getUsers);
router.patch("/admin/users/:id", updateUser);
router.delete("/admin/users/:id", deleteUser);

// Admin Publications
router.get("/admin/publications", getPublications);
router.patch("/admin/publications/:id", updatePublication);
router.delete("/admin/publications/:id", deletePublication);

export default router;