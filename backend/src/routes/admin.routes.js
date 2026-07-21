import { Router } from "express";
import {
  deleteUser,
  getUsers,
  updateUser,
  getPublications,
  updatePublication,
  deletePublication,
  getVerifiers,
  assignVerifier,
  removeVerifier,
} from "../controllers/admin.controller.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery, validateParams } from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

router.use("/admin", verifyToken, requireAdmin);

const userSearchSchema = z.object({
  search: z.string().optional(),
});

const userUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(["user", "admin", "verifier"]).optional(),
  is_banned: z.boolean().optional(),
});

const publicationQuerySchema = z.object({
  status: z.enum(["active", "sold", "inactive"]).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const publicationUpdateSchema = z.object({
  status: z.enum(["active", "sold", "inactive"]).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  contact_method: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

router.get("/admin/users", validateQuery(userSearchSchema), getUsers);
router.patch("/admin/users/:id", validateParams(idParamSchema), validateBody(userUpdateSchema), updateUser);
router.delete("/admin/users/:id", validateParams(idParamSchema), deleteUser);

router.get("/admin/verifiers", getVerifiers);
router.post("/admin/verifiers/:id", validateParams(idParamSchema), assignVerifier);
router.delete("/admin/verifiers/:id", validateParams(idParamSchema), removeVerifier);

router.get("/admin/publications", validateQuery(publicationQuerySchema), getPublications);
router.patch("/admin/publications/:id", validateParams(idParamSchema), validateBody(publicationUpdateSchema), updatePublication);
router.delete("/admin/publications/:id", validateParams(idParamSchema), deletePublication);

export default router;