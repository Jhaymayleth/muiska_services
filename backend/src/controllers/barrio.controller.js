import { barrioService } from "../services/barrio.service.js";

export const barrioController = {
  async search(req, res, next) {
    try {
      const { q = "", limit = 20 } = req.query;
      const barrios = await barrioService.searchBarrios(q, Math.min(50, parseInt(limit, 10)));
      res.json({ barrios });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const barrios = await barrioService.getAllBarrios();
      res.json({ barrios });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const barrio = await barrioService.getById(id);
      if (!barrio) {
        return res.status(404).json({ message: "Barrio not found" });
      }
      res.json({ barrio });
    } catch (error) {
      next(error);
    }
  },

  async getByLocality(req, res, next) {
    try {
      const { locality } = req.params;
      const barrios = await barrioService.getByLocality(locality);
      res.json({ barrios });
    } catch (error) {
      next(error);
    }
  },

  async getNearby(req, res, next) {
    try {
      const { lat, lng, radius_km = 5 } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ message: "lat and lng are required" });
      }
      const barrios = await barrioService.getNearby(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius_km)
      );
      res.json({ barrios });
    } catch (error) {
      next(error);
    }
  },
};
