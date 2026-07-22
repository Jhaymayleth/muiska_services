import { adminService } from "../services/admin.service.js";

const allowedRoles = new Set(["user", "admin", "verifier"]);

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

    if (role !== undefined && !allowedRoles.has(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (is_banned !== undefined && typeof is_banned !== "boolean") {
      return res.status(400).json({ message: "is_banned must be a boolean" });
    }

    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot modify your own account from this panel" });
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

    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account from this panel" });
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

export const assignVerifier = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot assign yourself" });
    }
    const verifier = await adminService.assignVerifier(id);
    res.json({ message: "Verifier assigned", verifier });
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const removeVerifier = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot remove yourself" });
    }
    const user = await adminService.removeVerifier(id);
    res.json({ message: "Verifier role removed", user });
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const getVerifiers = async (req, res, next) => {
  try {
    const verifiers = await adminService.getVerifiers();
    res.json(verifiers);
  } catch (error) {
    next(error);
  }
};

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
      return res.status(400).json({ message: "Invalid status" });
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