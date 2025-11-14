import express from "express";
const adminRoutes = express.Router();

import {
  getDashboardStats,
  getManagers,
  getSalesExecutives,
  getSalesRecords,
  getAuditLogs,
} from "../controllers/admin.controller.js";

import {
  authenticateToken,
  authorizeRole,
} from "../middleware/auth.middleware.js";

// =============================================================================
// ADMIN ONLY ROUTES - Administrative operations and analytics
// =============================================================================

/**
 * GET /api/admin/dashboard - Get dashboard statistics and charts data
 * Access: Admin only
 * Returns: Summary stats, charts data for leads over time and status distribution
 */
adminRoutes.get(
  "/dashboard",
  authenticateToken,
  authorizeRole(["admin"]),
  getDashboardStats
);

/**
 * GET /api/admin/managers - Get all managers with pagination and search
 * Query params: ?page=1&limit=10&search=john
 * Access: Admin only
 */
adminRoutes.get(
  "/managers",
  authenticateToken,
  authorizeRole(["admin"]),
  getManagers
);

/**
 * GET /api/admin/sales-executives - Get all sales executives with pagination and search
 * Query params: ?page=1&limit=10&search=jane
 * Access: Admin only
 */
adminRoutes.get(
  "/sales-executives",
  authenticateToken,
  authorizeRole(["admin"]),
  getSalesExecutives
);

/**
 * GET /api/admin/sales-records - Get all sales records (leads) with pagination and filtering
 * Query params: ?page=1&limit=10&search=company&status=Won
 * Access: Admin only
 */
adminRoutes.get(
  "/sales-records",
  authenticateToken,
  authorizeRole(["admin"]),
  getSalesRecords
);

/**
 * GET /api/admin/audit-logs - Get audit logs/history with pagination and filtering
 * Query params: ?page=1&limit=10&search=login&action=CREATE
 * Access: Admin only
 */
adminRoutes.get(
  "/audit-logs",
  authenticateToken,
  authorizeRole(["admin"]),
  getAuditLogs
);

export default adminRoutes;
