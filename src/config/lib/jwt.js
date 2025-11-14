import jwt from "jsonwebtoken";
import { config } from "../env/env.js";

// Generate JWT token
export const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, config.jwt_secret, {
      expiresIn: config.jwt_expires_in || "30d",
    });
    return token;
  } catch (error) {
    console.error("Error creating JWT:", error);
    throw new Error("Token generation failed");
  }
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    return decoded;
  } catch (error) {
    console.error("Error verifying JWT:", error);
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    throw new Error("Invalid token");
  }
};
