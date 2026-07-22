import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

const createRateLimiter = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message: { success: false, error: { code: 'RATE_LIMIT', message } },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: { code: 'RATE_LIMIT', message }
        });
    }
});

export const authLimiter = createRateLimiter(
    15 * 60 * 1000,
    10,
    'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.'
);

export const registerLimiter = createRateLimiter(
    60 * 60 * 1000,
    3,
    'Demasiados registros. Intenta de nuevo en 1 hora.'
);

export const apiLimiter = createRateLimiter(
    15 * 60 * 1000,
    config.rateLimit.maxRequests,
    'Demasiadas peticiones. Intenta de nuevo más tarde.'
);