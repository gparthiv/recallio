import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.routes.js"
import contentRoutes from "./routes/content.routes.js";
import brainRoutes from "./routes/brain.routes.js";
import noteRoutes from "./routes/note.routes.js";
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({ message: "Recallio is Working" });
});

app
  .use("/api/auth", authRoutes)
  .use("/api/v1/content", contentRoutes)
  .use("/api/v1/brain", brainRoutes)
  .use("/api/v1/note", noteRoutes);


async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
  });
}

startServer();