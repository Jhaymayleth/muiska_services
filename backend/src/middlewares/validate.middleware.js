import { z } from "zod";
import { ValidationError } from "../middlewares/error.middleware.js";

export const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const details = result.error.flatten().fieldErrors;
        return next(new ValidationError("Datos de entrada inválidos", details));
    }
    req.body = result.data;
    next();
};

export const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
        const details = result.error.flatten().fieldErrors;
        return next(new ValidationError("Parámetros de consulta inválidos", details));
    }
    req.query = result.data;
    next();
};

export const validateParams = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
        const details = result.error.flatten().fieldErrors;
        return next(new ValidationError("Parámetros de ruta inválidos", details));
    }
    req.params = result.data;
    next();
};