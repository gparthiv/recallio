import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import ragRoutes from "./routes/rag.routes.js";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.routes.js"
import contentRoutes from "./routes/content.routes.js";
import brainRoutes from "./routes/brain.routes.js";
import noteRoutes from "./routes/note.routes.js";
import captureRoutes from "./routes/capture.routes.js";
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({ message: "synapse is Working" });
});

app
  .use("/api/auth", authRoutes)
  .use("/api/v1/content", contentRoutes)
  .use("/api/v1/brain", brainRoutes)
  .use("/api/v1/note", noteRoutes)
  .use("/api/v1/capture", captureRoutes)
  .use("/api/v1/rag", ragRoutes);
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
  });
}

startServer();