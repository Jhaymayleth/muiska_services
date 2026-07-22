import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getPublicKey, subscribe, unsubscribe } from "../controllers/push.controller.js";

const router = Router();

router.get("/push/public-key", getPublicKey);
router.post("/push/subscribe", verifyToken, subscribe);
router.post("/push/unsubscribe", verifyToken, unsubscribe);

export default router;
