import { Router } from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../controllers/publication.controller.js";
import { verifyToken, optionalAuth } from "../middlewares/auth.middleware.js";
import { upload, handleUploadError } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/publications", getAll);
router.get("/publications/:id", getById);
router.post(
  "/publications",
  verifyToken,
  upload.array("images", 5),
  handleUploadError,
  create,
);
router.put(
  "/publications/:id",
  verifyToken,
  upload.array("images", 5),
  handleUploadError,
  update,
);
router.delete("/publications/:id", verifyToken, remove);

export default router;
