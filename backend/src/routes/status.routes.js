import { Router } from "express";
import { getStatus } from "../controllers/status.controller.js";
import { pool } from "../config/database.js";
import { config } from "../config/index.js";

const router = Router();

router.get("/status", getStatus);

router.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({
            success: true,
            status: "healthy",
            timestamp: new Date().toISOString(),
            version: config.env
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

export default router;
