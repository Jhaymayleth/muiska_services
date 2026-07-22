import { reviewService } from "../services/review.service.js";

export const createReview = async (req, res, next) => {
  try {
    const { publicationId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const review = await reviewService.create(publicationId, req.user.id, {
      rating: parseInt(rating, 10),
      comment,
    });

    res.status(201).json({ review });
  } catch (error) {
    if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
      return res.status(error.code === "NOT_FOUND" ? 404 : 403).json({ message: error.message });
    }
    next(error);
  }
};

export const getPublicationReviews = async (req, res, next) => {
  try {
    const { publicationId } = req.params;
    const reviews = await reviewService.getByPublication(publicationId);
    const average = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";
    res.json({ reviews, average: Number(average), total: reviews.length });
  } catch (error) {
    next(error);
  }
};

export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getByUser(req.user.id);
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};
