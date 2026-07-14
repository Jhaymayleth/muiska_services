import { Router } from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../controllers/publication.controller.js";

const router = Router();

router.get("/publications", getAll);
router.get("/publications/:id", getById);
router.post("/publications", create);
router.put("/publications/:id", update);
router.delete("/publications/:id", remove);

export default router;
