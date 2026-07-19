import { favoriteService } from "../services/favorite.service.js";

// Controlador de favoritos: solo maneja HTTP, delega a service

export const toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { publicationId } = req.params;

    const result = await favoriteService.toggleFavorite(userId, publicationId);
    res.json({
      message: result.favorited
        ? "Agregado a favoritos"
        : "Eliminado de favoritos",
      favorited: result.favorited,
    });
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const getMyFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 12 } = req.query;

    const result = await favoriteService.getFavorites(userId, { page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const checkFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { publicationId } = req.params;

    const result = await favoriteService.checkFavorite(userId, publicationId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};