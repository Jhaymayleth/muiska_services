import { authService } from "../services/auth.service.js";
import { 
  validateRegister, 
  validateLogin, 
  validateUpdateProfile, 
  validateChangePassword 
} from "../validators/auth.validator.js";

// Controlador de autenticación: solo maneja HTTP (req/res), delega lógica a authService

export const register = async (req, res, next) => {
  try {
    // Validar entrada usando validator
    const errors = validateRegister(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Delegar lógica al servicio
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    // Manejar errores específicos del servicio
    if (error.code === "EMAIL_EXISTS") {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Delegar al servicio
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
    // Validar entrada
    const errors = validateUpdateProfile(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Delegar al servicio
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
    // Validar entrada
    const errors = validateChangePassword(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Delegar al servicio
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