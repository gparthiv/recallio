import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getContent, addContent, deleteContent } from "../controllers/content.controller.js";
const router = Router();
router
  .get("/", authMiddleware, getContent)
  .post("/", authMiddleware, addContent)
  .delete("/", authMiddleware, deleteContent);

export default router;