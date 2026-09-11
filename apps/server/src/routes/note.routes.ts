import { Router } from "express";

import { shareNote, getSharedNote } from "../controllers/note.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router
  .post("/:contentId/share", authMiddleware, shareNote)
  .get("/share/:shareLink", getSharedNote);

export default router;