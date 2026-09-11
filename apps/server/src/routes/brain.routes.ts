import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { shareBrain, getSharedBrain } from "../controllers/brain.controller.js";

const router = Router();

router
  .post("/share", authMiddleware, shareBrain)
  .get("/:shareLink", getSharedBrain);
export default router;