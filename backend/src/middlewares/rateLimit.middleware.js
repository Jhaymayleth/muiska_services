import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

const createRateLimiter = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message
        });
    }
});

export const authLimiter = createRateLimiter(
    15 * 60 * 1000,
    10,
    'Too many authentication attempts. Try again in 15 minutes.'
);

export const registerLimiter = createRateLimiter(
    60 * 60 * 1000,
    3,
    'Too many registration attempts. Try again in 1 hour.'
);

export const apiLimiter = createRateLimiter(
    15 * 60 * 1000,
    config.rateLimit.maxRequests,
    'Too many requests. Try again later.'
);

export const notificationLimiter = createRateLimiter(
    60 * 1000,
    30,
    'Too many notification requests. Try again later.'
);