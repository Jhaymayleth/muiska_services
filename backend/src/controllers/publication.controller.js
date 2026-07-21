import { publicationService } from "../services/publication.service.js";
import { normalizePublicationPayload } from "../utils/publication.utils.js";

export const getAll = async (req, res, next) => {
  try {
    const result = await publicationService.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const publication = await publicationService.getById(id);
    res.json(publication);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const getMine = async (req, res, next) => {
  try {
    const publications = await publicationService.getMine(req.user.id);
    res.json(publications);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const normalized = normalizePublicationPayload(req.body);

    let images = normalized.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    const publication = await publicationService.create(req.user.id, {
      ...normalized,
      images,
    });

    res.status(201).json(publication);
  } catch (error) {
    if (error.code === "INVALID_PRICE") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const normalized = normalizePublicationPayload(req.body);

    let images = normalized.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    const publication = await publicationService.update(req.user.id, id, {
      ...normalized,
      images,
      status: req.body.status,
    });

    res.json(publication);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    if (error.code === "INVALID_PRICE") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await publicationService.remove(req.user.id, id);
    res.json(result);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};