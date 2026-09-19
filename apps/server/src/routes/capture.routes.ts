import { Router } from "express";
import { captureContent } from "../controllers/capture.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, captureContent);

export default router;