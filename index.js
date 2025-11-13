import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db/db.js";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.listen(4545, async () => {
  try {
    await connectDB();
    console.log("Server is running on port 4545");
  } catch (error) {
    console.error("Error connecting to the server:", error.message);
  }
});
