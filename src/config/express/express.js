import express from "express";
import { connectDB } from "../db/db.js";
import mainRoutes from "../../routes/main.routes.js";
import cors from "cors";
import { config } from "../env/env.js";

export const initializeExpressApp = async () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  mainRoutes(app);

  app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
  });

  app.listen(config.port, async () => {
    try {
      await connectDB();
      console.log(`Server is running on port ${config.port}`);
    } catch (error) {
      console.error("Error connecting to the server:", error.message);
    }
  });
};
