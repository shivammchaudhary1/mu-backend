import express from "express";
const leadRoutes = express.Router();

import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  updateLeadPriority,
  deleteLead,
  getMyLeads,
  getLeadStats,
} from "../controllers/lead.controller.js";

import {
  authenticateToken,
  authorizeRole,
} from "../middleware/auth.middleware.js";

// =============================================================================
// PUBLIC ROUTES - Accessible to all authenticated users (any role)
// =============================================================================

/**
 * GET /api/leads - Get all leads with optional filtering
 * Query params: ?status=New&priority=High&owner_id=123
 * Access: All authenticated users
 */
leadRoutes.get("/", authenticateToken, getAllLeads);

/**
 * GET /api/leads/all - Get all leads (for managers and admins)
 * Access: Admin, Manager only
 */
leadRoutes.get(
  "/all",
  authenticateToken,
  authorizeRole(["admin", "manager"]),
  getAllLeads
);

/**
 * GET /api/leads/:id - Get specific lead by ID
 * Access: All authenticated users
 */
leadRoutes.get("/:id", authenticateToken, getLeadById);

/**
 * GET /api/leads/my/leads - Get leads assigned to the authenticated user
 * Access: All authenticated users (returns leads based on their user ID)
 */
leadRoutes.get("/my/leads", authenticateToken, getMyLeads);

// =============================================================================
// ADMIN, MANAGER & SALES EXECUTIVE ROUTES - Lead management operations
// =============================================================================

/**
 * POST /api/leads - Create new lead
 * Access: Admin, Manager, Sales Executive
 * Required: leadname, owner_id
 * Optional: company, email, mobile, priority, status
 */
leadRoutes.post(
  "/create",
  authenticateToken,
  authorizeRole(["admin", "manager", "sales_executive"]),
  createLead
);

/**
 * PUT /api/leads/:id - Update lead (all fields)
 * Access: Admin, Manager, Sales Executive
 * Updatable: leadname, company, email, mobile, priority, status, owner_id
 */
leadRoutes.put(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "manager", "sales_executive"]),
  updateLead
);

/**
 * PATCH /api/leads/:id/status - Update lead status
 * Access: Admin, Manager, Sales Executive
 * Status options: New, Contacted, Qualified, Proposal, Negotiation, Won, Lost
 */
leadRoutes.patch(
  "/:id/status",
  authenticateToken,
  authorizeRole(["admin", "manager", "sales_executive"]),
  updateLeadStatus
);

/**
 * PATCH /api/leads/:id/priority - Update lead priority
 * Access: Admin, Manager, Sales Executive
 * Priority options: High, Medium, Low
 */
leadRoutes.patch(
  "/:id/priority",
  authenticateToken,
  authorizeRole(["admin", "manager", "sales_executive"]),
  updateLeadPriority
);

// =============================================================================
// MANAGER ONLY ROUTES - High-level management operations
// =============================================================================

/**
 * DELETE /api/leads/:id - Delete lead permanently
 * Access: Manager only
 * Warning: This operation is irreversible
 */
leadRoutes.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["manager"]),
  deleteLead
);

// =============================================================================
// ADMIN & MANAGER ROUTES - Analytics and reporting
// =============================================================================

/**
 * GET /api/leads/stats/overview - Get comprehensive lead statistics
 * Access: Admin, Manager only
 * Returns: Count by status, priority, conversion rates, etc.
 */
leadRoutes.get(
  "/stats/overview",
  authenticateToken,
  authorizeRole(["admin", "manager"]),
  getLeadStats
);

export default leadRoutes;
