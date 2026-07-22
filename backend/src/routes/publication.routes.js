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
import { validateBody, validateQuery, validateParams } from "../middlewares/validate.middleware.js";
import { createPublicationSchema, updatePublicationSchema, publicationQuerySchema } from "../validators/schemas.js";
import { z } from "zod";

const router = Router();

const idParamSchema = z.object({
    id: z.string().uuid("Invalid publication ID"),
});

router.get("/publications", validateQuery(publicationQuerySchema), getAll);
router.get("/publications/mine", verifyToken, validateQuery(publicationQuerySchema), getMine);
router.get("/publications/:id", validateParams(idParamSchema), getById);
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
    validateParams(idParamSchema),
    upload.array("images", 5),
    handleUploadError,
    validateBody(updatePublicationSchema),
    update,
);
router.delete("/publications/:id", verifyToken, validateParams(idParamSchema), remove);

export default router;
