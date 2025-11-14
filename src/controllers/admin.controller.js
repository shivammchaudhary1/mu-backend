import User from "../models/user.model.js";
import Lead from "../models/lead.model.js";
import pool from "../config/db/db.js";

// Helper function to run queries
const runQuery = async (query, params = []) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Database error:", error.message);
    throw error;
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get user counts by role
    const managerCount = await runQuery(
      "SELECT COUNT(*) as count FROM users WHERE role = 'manager'"
    );
    const salesExecutiveCount = await runQuery(
      "SELECT COUNT(*) as count FROM users WHERE role = 'sales_executive'"
    );

    // Get lead statistics
    const leadStats = await Lead.getStats();

    // Get leads created over time (last 30 days)
    const leadsOverTime = await runQuery(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM leads 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Get lead status distribution
    const leadStatusDistribution = await runQuery(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM leads)), 2) as percentage
      FROM leads
      GROUP BY status
      ORDER BY count DESC
    `);

    const dashboardData = {
      summary: {
        totalManagers: parseInt(managerCount[0]?.count || 0),
        totalSalesExecutives: parseInt(salesExecutiveCount[0]?.count || 0),
        totalLeads: parseInt(leadStats.total_leads || 0),
        wonLeads: parseInt(leadStats.won_leads || 0),
        lostLeads: parseInt(leadStats.lost_leads || 0),
        pendingLeads:
          parseInt(leadStats.total_leads || 0) -
          parseInt(leadStats.won_leads || 0) -
          parseInt(leadStats.lost_leads || 0),
      },
      charts: {
        leadsOverTime: leadsOverTime,
        leadStatusDistribution: leadStatusDistribution,
      },
      leadStats: leadStats,
    };

    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard statistics",
      error: error.message,
    });
  }
};

// Get all managers with pagination and search
export const getManagers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, email, role, status, created_at
      FROM users 
      WHERE role = 'manager'
    `;
    let countQuery = "SELECT COUNT(*) FROM users WHERE role = 'manager'";
    const params = [];

    if (search) {
      query += ` AND (name ILIKE $1 OR email ILIKE $1)`;
      countQuery += ` AND (name ILIKE $1 OR email ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    const [managers, totalCount] = await Promise.all([
      runQuery(query, params),
      runQuery(countQuery, search ? [`%${search}%`] : []),
    ]);

    res.status(200).json({
      success: true,
      message: "Managers retrieved successfully",
      data: {
        managers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(totalCount[0].count),
          pages: Math.ceil(totalCount[0].count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get managers error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve managers",
      error: error.message,
    });
  }
};

// Get all sales executives with pagination and search
export const getSalesExecutives = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at,
             COUNT(l.id) as assigned_leads
      FROM users u
      LEFT JOIN leads l ON u.id = l.owner_id
      WHERE u.role = 'sales_executive'
    `;
    let countQuery =
      "SELECT COUNT(*) FROM users WHERE role = 'sales_executive'";
    const params = [];

    if (search) {
      query += ` AND (u.name ILIKE $1 OR u.email ILIKE $1)`;
      countQuery += ` AND (name ILIKE $1 OR email ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY u.id, u.name, u.email, u.role, u.status, u.created_at`;
    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    const [salesExecutives, totalCount] = await Promise.all([
      runQuery(query, params),
      runQuery(countQuery, search ? [`%${search}%`] : []),
    ]);

    res.status(200).json({
      success: true,
      message: "Sales executives retrieved successfully",
      data: {
        salesExecutives,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(totalCount[0].count),
          pages: Math.ceil(totalCount[0].count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get sales executives error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sales executives",
      error: error.message,
    });
  }
};

// Get sales records (leads with sales information) with pagination and search
export const getSalesRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT l.*, u.name as owner_name
      FROM leads l
      LEFT JOIN users u ON l.owner_id = u.id
      WHERE 1=1
    `;
    let countQuery = "SELECT COUNT(*) FROM leads l WHERE 1=1";
    const params = [];

    if (search) {
      query += ` AND (l.leadname ILIKE $${
        params.length + 1
      } OR l.company ILIKE $${params.length + 1} OR l.email ILIKE $${
        params.length + 1
      })`;
      countQuery += ` AND (l.leadname ILIKE $${
        params.length + 1
      } OR l.company ILIKE $${params.length + 1} OR l.email ILIKE $${
        params.length + 1
      })`;
      params.push(`%${search}%`);
    }

    if (status) {
      query += ` AND l.status = $${params.length + 1}`;
      countQuery += ` AND l.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    const [leads, totalCount] = await Promise.all([
      runQuery(query, params),
      runQuery(countQuery, params.slice(0, -2)), // Remove limit and offset for count
    ]);

    res.status(200).json({
      success: true,
      message: "Sales records retrieved successfully",
      data: {
        leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(totalCount[0].count),
          pages: Math.ceil(totalCount[0].count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get sales records error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sales records",
      error: error.message,
    });
  }
};

// Create audit log table if it doesn't exist
const createAuditLogTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INTEGER,
      old_values JSONB,
      new_values JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await runQuery(createTableQuery);
    console.log("Audit logs table ready");
  } catch (error) {
    console.error("Error creating audit logs table:", error.message);
  }
};

// Initialize audit log table
createAuditLogTable();

// Get historical events/audit logs with pagination and search
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", action = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, u.name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    let countQuery = "SELECT COUNT(*) FROM audit_logs a WHERE 1=1";
    const params = [];

    if (search) {
      query += ` AND (a.action ILIKE $${
        params.length + 1
      } OR a.entity_type ILIKE $${params.length + 1} OR u.name ILIKE $${
        params.length + 1
      })`;
      countQuery += ` AND (a.action ILIKE $${
        params.length + 1
      } OR a.entity_type ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (action) {
      query += ` AND a.action = $${params.length + 1}`;
      countQuery += ` AND a.action = $${params.length + 1}`;
      params.push(action);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    const [auditLogs, totalCount] = await Promise.all([
      runQuery(query, params),
      runQuery(countQuery, params.slice(0, -2)), // Remove limit and offset for count
    ]);

    res.status(200).json({
      success: true,
      message: "Audit logs retrieved successfully",
      data: {
        auditLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(totalCount[0].count),
          pages: Math.ceil(totalCount[0].count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve audit logs",
      error: error.message,
    });
  }
};

// Helper function to log audit events
export const logAuditEvent = async (
  userId,
  action,
  entityType,
  entityId,
  oldValues = null,
  newValues = null
) => {
  try {
    const query = `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await runQuery(query, [
      userId,
      action,
      entityType,
      entityId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
    ]);
  } catch (error) {
    console.error("Error logging audit event:", error.message);
  }
};
