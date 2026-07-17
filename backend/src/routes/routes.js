import { Router } from "express";
import { register, login, getMe, updateProfile, changePassword, deleteAccount } from "../controllers/auth.controller.js";
import { getAll as getAllPubs, getById as getPubById, create as createPub, update as updatePub, remove as removePub } from "../controllers/publication.controller.js";
import { getAll as getAllCats, getById as getCatById, create as createCat, update as updateCat, remove as removeCat } from "../controllers/category.controller.js";
import { verifyToken, requireRole } from "../middlewares/auth.middleware.js";
import { upload, handleUploadError } from "../middlewares/upload.middleware.js";

const router = Router();

// Rutas de autenticación
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", verifyToken, getMe);
router.put("/auth/me", verifyToken, updateProfile);
router.put("/auth/change-password", verifyToken, changePassword);
router.delete("/auth/me", verifyToken, deleteAccount);

// Rutas de publicaciones
router.get("/publications", getAllPubs);
router.get("/publications/:id", getPubById);
router.post("/publications", verifyToken, upload.array("images", 5), handleUploadError, createPub);
router.put("/publications/:id", verifyToken, upload.array("images", 5), handleUploadError, updatePub);
router.delete("/publications/:id", verifyToken, removePub);

// Rutas de categorías
router.get("/categories", getAllCats);
router.get("/categories/:id", getCatById);
router.post("/categories", verifyToken, requireRole("admin"), createCat);
router.put("/categories/:id", verifyToken, requireRole("admin"), updateCat);
router.delete("/categories/:id", verifyToken, requireRole("admin"), removeCat);

export default router;