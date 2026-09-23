import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { chatWithRag } from "../controllers/rag.controller.js";

const router = Router();

router.post("/chat", authMiddleware, chatWithRag);

export default router;