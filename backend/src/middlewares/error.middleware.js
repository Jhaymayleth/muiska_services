import { config } from "../config/index.js";
import logger from "../config/logger.js";

export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Permisos insuficientes") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, "CONFLICT");
  }
}

function logError(err, req) {
  const logData = {
    requestId: req?.requestId,
    timestamp: new Date().toISOString(),
    level: err.isOperational ? "warn" : "error",
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req?.path,
    method: req?.method,
    ip: req?.ip,
    userId: req?.user?.id,
    stack: config.isProduction ? undefined : err.stack,
  };
  logger[logData.level === "error" ? "error" : "warn"](logData, err.message);
}

export const errorMiddleware = (err, req, res, next) => {
  logError(err, req);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      requestId: req.requestId,
      ...(err.details && { details: err.details }),
    });
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case "23505": // unique_violation
        return res.status(409).json({
          success: false,
          message: "El registro ya existe",
          code: "CONFLICT",
          requestId: req.requestId,
        });
      case "23503": // foreign_key_violation
        return res.status(400).json({
          success: false,
          message: "Referencia inválida",
          code: "INVALID_REFERENCE",
          requestId: req.requestId,
        });
      case "23502": // not_null_violation
        return res.status(400).json({
          success: false,
          message: "Campo requerido faltante",
          code: "VALIDATION_ERROR",
          requestId: req.requestId,
        });
      case "22P02": // invalid_text_representation (e.g., UUID format)
        return res.status(400).json({
          success: false,
          message: "Formato de ID inválido",
          code: "INVALID_ID",
          requestId: req.requestId,
        });
    }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
      code: "INVALID_TOKEN",
      requestId: req.requestId,
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expirado",
      code: "TOKEN_EXPIRED",
      requestId: req.requestId,
    });
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Archivo demasiado grande",
      code: "FILE_TOO_LARGE",
      requestId: req.requestId,
    });
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Campo de archivo inesperado",
      code: "INVALID_FILE_FIELD",
      requestId: req.requestId,
    });
  }

  // Default 500
  const message = config.isProduction
    ? "Error interno del servidor"
    : err.message || "Error interno del servidor";

  return res.status(500).json({
    success: false,
    message,
    code: "INTERNAL_ERROR",
    requestId: req.requestId,
    ...(!config.isProduction && { stack: err.stack }),
  });
};

export const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
    code: "NOT_FOUND",
    requestId: req.requestId,
  });
};