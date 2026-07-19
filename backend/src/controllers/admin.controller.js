import { adminService } from "../services/admin.service.js";

// Controlador de administración: solo maneja HTTP, delega a adminService

const allowedRoles = new Set(["user", "admin"]);

export const getUsers = async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const users = await adminService.getUsers(search);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_banned, name, email } = req.body;

    // Validar rol si se envía
    if (role !== undefined && !allowedRoles.has(role)) {
      return res.status(400).json({ message: "Rol no válido" });
    }

    // Validar is_banned si se envía
    if (is_banned !== undefined && typeof is_banned !== "boolean") {
      return res.status(400).json({ message: "El estado de suspensión no es válido" });
    }

    // Prevenir auto-gestión
    if (id === req.user.id) {
      return res.status(400).json({ message: "No puedes modificar tu propia cuenta desde este panel" });
    }

    const user = await adminService.updateUser(id, { name, email, role, is_banned });
    res.json(user);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevenir auto-eliminación
    if (id === req.user.id) {
      return res.status(400).json({ message: "No puedes eliminar tu propia cuenta desde este panel" });
    }

    const result = await adminService.deleteUser(id);
    res.json(result);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// Admin - Publications
export const getPublications = async (req, res, next) => {
  try {
    const { status, search, category, page = 1, limit = 20 } = req.query;
    const result = await adminService.getPublications({ status, search, category, page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updatePublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, title, description, price, category, location, contact_method } = req.body;

    if (status && !["active", "sold", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const publication = await adminService.updatePublication(id, {
      status,
      title,
      description,
      price,
      category,
      location,
      contact_method,
    });

    res.json(publication);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const deletePublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deletePublication(id);
    res.json(result);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};