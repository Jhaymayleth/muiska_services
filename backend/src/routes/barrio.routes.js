import { Router } from "express";
import { barrioController } from "../controllers/barrio.controller.js";

const router = Router();

router.get("/neighborhoods", barrioController.getAll);
router.get("/neighborhoods/search", barrioController.search);
router.get("/neighborhoods/nearby", barrioController.getNearby);
router.get("/neighborhoods/locality/:locality", barrioController.getByLocality);
router.get("/neighborhoods/:id", barrioController.getById);

export default router;
