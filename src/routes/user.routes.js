import express from "express";
const userRoutes = express.Router();

import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import {
  authenticateToken,
  authorizeRole,
} from "../middleware/auth.middleware.js";

// =============================================================================
// MANAGER & ADMIN ROUTES - User management operations
// =============================================================================

/**
 * GET /api/users - Get all users with optional role filtering
 * Query params: ?role=sales_executive
 * Access: Admin, Manager
 */
userRoutes.get(
  "/",
  authenticateToken,
  authorizeRole(["admin", "manager"]),
  getAllUsers
);

/**
 * GET /api/users/:id - Get specific user by ID
 * Access: Admin, Manager
 */
userRoutes.get(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "manager"]),
  getUserById
);

// =============================================================================
// ADMIN ONLY ROUTES - User management operations
// =============================================================================

/**
 * PUT /api/users/:id - Update user details
 * Access: Admin only
 */
userRoutes.put("/:id", authenticateToken, authorizeRole(["admin"]), updateUser);

/**
 * DELETE /api/users/:id - Delete user permanently
 * Access: Admin only
 * Warning: This operation is irreversible
 */
userRoutes.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  deleteUser
);

export default userRoutes;
