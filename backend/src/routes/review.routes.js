import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createReview, getPublicationReviews, getMyReviews } from "../controllers/review.controller.js";

const router = Router();

router.get("/publications/:publicationId/reviews", getPublicationReviews);
router.post("/publications/:publicationId/reviews", verifyToken, createReview);
router.get("/reviews/me", verifyToken, getMyReviews);

export default router;
