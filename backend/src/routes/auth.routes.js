import { Router } from "express";
import { register, login, getMe, updateProfile, updateAddress, changePassword, deleteAccount } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", verifyToken, getMe);
router.put("/auth/me", verifyToken, updateProfile);
router.put("/auth/me/address", verifyToken, updateAddress);
router.put("/auth/change-password", verifyToken, changePassword);
router.delete("/auth/me", verifyToken, deleteAccount);

export default router;
