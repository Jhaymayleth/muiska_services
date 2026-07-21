import { Router } from "express";
import { pool } from "../config/database.js";
import { config } from "../config/index.js";

const router = Router();

router.get("/health", async (_req, res) => {
    const start = Date.now();
    let dbStatus = "disconnected";
    let dbLatency = null;

    try {
        const dbStart = Date.now();
        await pool.query("SELECT 1");
        dbLatency = `${Date.now() - dbStart}ms`;
        dbStatus = "connected";
    } catch (error) {
        dbStatus = "error";
    }

    const uptime = process.uptime();
    const memory = process.memoryUsage();

    const health = {
        status: dbStatus === "connected" ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime)}s`,
        memory: {
            rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`
        },
        database: {
            status: dbStatus,
            latency: dbLatency
        },
        environment: config.env,
        version: "1.0.0"
    };

    const statusCode = health.status === "ok" ? 200 : 503;
    res.status(statusCode).json(health);
});

router.get("/health/live", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/health/ready", async (_req, res) => {
    try {
        await pool.query("SELECT 1");
        res.status(200).json({ status: "ready", timestamp: new Date().toISOString() });
    } catch {
        res.status(503).json({ status: "not ready", timestamp: new Date().toISOString() });
    }
});

export default router;