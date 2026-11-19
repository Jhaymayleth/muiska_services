import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { createReviewSchema } from "../validators/schemas.js";
import { createReview, getPublicationReviews, getMyReviews } from "../controllers/review.controller.js";

const router = Router();

router.get("/publications/:publicationId/reviews", getPublicationReviews);
router.post(
    "/publications/:publicationId/reviews",
    verifyToken,
    validateBody(createReviewSchema),
    createReview
);
router.get("/reviews/me", verifyToken, getMyReviews);

export default router;
