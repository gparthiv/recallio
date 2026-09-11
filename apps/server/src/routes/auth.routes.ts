import { Router } from "express";
import { signup, signin } from "../controllers/auth.controller.js";

const router = Router();

router
  .post("/signup", signup)
  .post("/signin", signin);

export default router;