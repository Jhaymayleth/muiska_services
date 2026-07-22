import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { z } from "zod";
import { chatController } from "../controllers/chat.controller.js";

const router = Router();

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const createConversationSchema = z.object({
  publicationId: z.string().uuid(),
  sellerId: z.string().uuid(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

router.get("/conversations", verifyToken, chatController.getConversations);
router.post("/conversations", verifyToken, validateBody(createConversationSchema), chatController.createConversation);
router.get("/conversations/:id", verifyToken, validateParams(idParamSchema), chatController.getConversation);
router.get("/conversations/:id/messages", verifyToken, validateParams(idParamSchema), validateQuery(querySchema), chatController.getMessages);
router.post("/conversations/:id/messages", verifyToken, validateParams(idParamSchema), validateBody(sendMessageSchema), chatController.sendMessage);
router.post("/conversations/:id/read", verifyToken, validateParams(idParamSchema), chatController.markRead);

export default router;
