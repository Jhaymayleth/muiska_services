import { authService } from "../services/auth.service.js";

// Auth controller: only handles HTTP, delegates to authService

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.code === "EMAIL_EXISTS") {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    if (error.code === "INVALID_CREDENTIALS") {
      return res.status(401).json({ message: error.message });
    }
    if (error.code === "BANNED") {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json(user);
  } catch (error) {
    if (error.code === "EMAIL_EXISTS") {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    if (error.code === "INVALID_PASSWORD") {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const result = await authService.deleteAccount(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};