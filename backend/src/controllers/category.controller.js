import { categoryService } from "../services/category.service.js";
import { validateCreateCategory, validateUpdateCategory } from "../validators/category.validator.js";

// Controlador de categorías: solo maneja HTTP, delega a categoryService

export const getAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getAll();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getById(id);
    res.json(category);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validateCreateCategory(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Delegar al servicio
    const category = await categoryService.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "La categoría ya existe" });
    }
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar entrada
    const errors = validateUpdateCategory(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Delegar al servicio
    const category = await categoryService.update(id, req.body);
    res.json(category);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    if (error.code === "23505") {
      return res.status(409).json({ message: "La categoría ya existe" });
    }
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await categoryService.remove(id);
    res.json(result);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};