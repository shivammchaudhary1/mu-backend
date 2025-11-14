import express from "express";
const authRoutes = express.Router();
import { register, login } from "../controllers/auth.controller.js";

// Register route
authRoutes.post("/register", register);

// Login route
authRoutes.post("/login", login);

export default authRoutes;
