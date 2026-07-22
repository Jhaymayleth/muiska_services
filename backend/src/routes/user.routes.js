import { Router } from "express";
import { getPublicProfile } from "../controllers/user.controller.js";

const router = Router();

router.get("/users/:id/profile", getPublicProfile);

export default router;
