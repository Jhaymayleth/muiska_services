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
import { validateBody, validateQuery } from "../middlewares/validate.middleware.js";
import { createPublicationSchema, updatePublicationSchema, publicationQuerySchema } from "../validators/schemas.js";

const router = Router();

router.get("/publications", validateQuery(publicationQuerySchema), getAll);
router.get("/publications/mine", verifyToken, validateQuery(publicationQuerySchema), getMine);
router.get("/publications/:id", getById);
router.post(
    "/publications",
    verifyToken,
    requireVerifiedSeller,
    upload.array("images", 5),
    handleUploadError,
    validateBody(createPublicationSchema),
    create,
);
router.put(
    "/publications/:id",
    verifyToken,
    upload.array("images", 5),
    handleUploadError,
    validateBody(updatePublicationSchema),
    update,
);
router.delete("/publications/:id", verifyToken, remove);

export default router;
