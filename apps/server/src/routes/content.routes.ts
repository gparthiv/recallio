import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getContent,
  addContent,
  updateContent,
  deleteContent,
} from "../controllers/content.controller.js";

const router = Router();

router
  .get("/", authMiddleware, getContent)
  .post("/", authMiddleware, addContent)
  .put("/:contentId", authMiddleware, updateContent)
  .delete("/", authMiddleware, deleteContent);

export default router;
