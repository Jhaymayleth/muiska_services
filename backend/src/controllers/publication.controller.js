import { publicationService } from "../services/publication.service.js";
import { normalizePublicationPayload } from "../utils/publication.utils.js";
import { 
  validateCreatePublication, 
  validateUpdatePublication,
  isValidPublicationPrice 
} from "../validators/publication.validator.js";

// Controlador de publicaciones: solo maneja HTTP, delega a publicationService

export const getAll = async (req, res, next) => {
  try {
    // Pasar query params al servicio
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
    // Normalizar payload
    const normalized = normalizePublicationPayload(req.body);

    // Validar usando validator
    const errors = validateCreatePublication(normalized);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Preparar imágenes si hay archivos subidos
    let images = normalized.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    // Delegar al servicio
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

    // Validar usando validator
    const errors = validateUpdatePublication(normalized);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Preparar imágenes
    let images = normalized.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    // Delegar al servicio
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