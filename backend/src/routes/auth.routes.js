import { Router } from "express";
import { register, login, getMe, updateProfile, changePassword, deleteAccount } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { registerLimiter, authLimiter } from "../middlewares/rateLimit.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../validators/schemas.js";

const router = Router();

router.post("/auth/register", registerLimiter, validateBody(registerSchema), register);
router.post("/auth/login", authLimiter, validateBody(loginSchema), login);
router.get("/auth/me", verifyToken, getMe);
router.put("/auth/me", verifyToken, validateBody(updateProfileSchema), updateProfile);
router.put("/auth/change-password", verifyToken, validateBody(changePasswordSchema), changePassword);
router.delete("/auth/me", verifyToken, deleteAccount);

export default router;
