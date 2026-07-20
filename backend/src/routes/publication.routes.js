import { Router } from "express";
import {
  getAll,
  getById,
  getMine,
  create,
  update,
  remove,
} from "../controllers/publication.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireVerifiedSeller } from "../middlewares/verification.middleware.js";
import { upload, handleUploadError } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/publications", getAll);
router.get("/publications/mine", verifyToken, getMine);
router.get("/publications/:id", getById);
router.post(
  "/publications",
  verifyToken,
  requireVerifiedSeller,
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
