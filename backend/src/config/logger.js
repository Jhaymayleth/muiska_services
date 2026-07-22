import pino from 'pino';
import { config } from './index.js';
import crypto from 'crypto';

const isProduction = config.isProduction;

const logger = pino({
    level: config.env === 'development' ? 'debug' : 'info',
    transport: config.env === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    } : undefined,
    formatters: {
        level: (label) => {
            return { level: label };
        }
    },
    base: {
        service: 'muiska-backend',
        env: config.env
    }
});

export const createRequestLogger = (req, res, next) => {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        };

        if (res.statusCode >= 500) {
            logger.error(logData, 'Request completed with error');
        } else if (res.statusCode >= 400) {
            logger.warn(logData, 'Request completed with client error');
        } else {
            logger.info(logData, 'Request completed');
        }
    });

    next();
};

export default logger;