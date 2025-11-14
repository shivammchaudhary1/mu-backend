import pool from "../config/db/db.js";

// Simple method to run any database query
const runQuery = async (query, params = []) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Database error:", error.message);
    throw error;
  }
};

// Create leads table
const createTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      leadname VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      mobile VARCHAR(20),
      priority VARCHAR(10) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
      status VARCHAR(20) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost')),
      owner_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await runQuery(createTableQuery);
    console.log("Leads table ready");
  } catch (error) {
    console.error("Error creating leads table:", error.message);
  }
};

const Lead = {
  // Add new lead
  add: async (
    leadname,
    company,
    email,
    mobile,
    priority = "Medium",
    status = "New",
    owner_id
  ) => {
    const query = `
      INSERT INTO leads (leadname, company, email, mobile, priority, status, owner_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const result = await runQuery(query, [
      leadname,
      company,
      email,
      mobile,
      priority,
      status,
      owner_id,
    ]);
    return result[0];
  },

  // Get all leads
  getAll: async () => {
    const query = `
      SELECT l.*, u.name as owner_name 
      FROM leads l 
      LEFT JOIN users u ON l.owner_id = u.id 
      ORDER BY l.created_at DESC
    `;
    return await runQuery(query);
  },

  // Get lead by ID
  getById: async (id) => {
    const query = `
      SELECT l.*, u.name as owner_name 
      FROM leads l 
      LEFT JOIN users u ON l.owner_id = u.id 
      WHERE l.id = $1
    `;
    const result = await runQuery(query, [id]);
    return result[0];
  },

  // Get lead by email
  getByEmail: async (email) => {
    const query = `
      SELECT l.*, u.name as owner_name 
      FROM leads l 
      LEFT JOIN users u ON l.owner_id = u.id 
      WHERE l.email = $1
    `;
    const result = await runQuery(query, [email]);
    return result[0];
  },

  // Get leads by owner (sales executive)
  getByOwnerId: async (owner_id) => {
    const query = `
      SELECT l.*, u.name as owner_name 
      FROM leads l 
      LEFT JOIN users u ON l.owner_id = u.id 
      WHERE l.owner_id = $1 
      ORDER BY l.created_at DESC
    `;
    return await runQuery(query, [owner_id]);
  },

  // Get leads by status
  getByStatus: async (status) => {
    const query = `
      SELECT l.*, u.name as owner_name 
      FROM leads l 
      LEFT JOIN users u ON l.owner_id = u.id 
      WHERE l.status = $1 
      ORDER BY l.created_at DESC
    `;
    return await runQuery(query, [status]);
  },

  // Get leads by priority
  getByPriority: async (priority) => {
    const query = `
      SELECT l.*, u.name as owner_name 
      FROM leads l 
      LEFT JOIN users u ON l.owner_id = u.id 
      WHERE l.priority = $1 
      ORDER BY l.created_at DESC
    `;
    return await runQuery(query, [priority]);
  },

  // Update lead
  update: async (id, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    const query = `
      UPDATE leads 
      SET ${setClause} 
      WHERE id = $1 
      RETURNING *
    `;

    const result = await runQuery(query, [id, ...values]);
    return result[0];
  },

  // Update lead status
  updateStatus: async (id, status) => {
    const query = `
      UPDATE leads 
      SET status = $2 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await runQuery(query, [id, status]);
    return result[0];
  },

  // Update lead priority
  updatePriority: async (id, priority) => {
    const query = `
      UPDATE leads 
      SET priority = $2 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await runQuery(query, [id, priority]);
    return result[0];
  },

  // Delete lead
  delete: async (id) => {
    const query = "DELETE FROM leads WHERE id = $1 RETURNING *";
    const result = await runQuery(query, [id]);
    return result[0];
  },

  // Get leads statistics
  getStats: async () => {
    const query = `
      SELECT 
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'New' THEN 1 END) as new_leads,
        COUNT(CASE WHEN status = 'Contacted' THEN 1 END) as contacted_leads,
        COUNT(CASE WHEN status = 'Qualified' THEN 1 END) as qualified_leads,
        COUNT(CASE WHEN status = 'Proposal' THEN 1 END) as proposal_leads,
        COUNT(CASE WHEN status = 'Negotiation' THEN 1 END) as negotiation_leads,
        COUNT(CASE WHEN status = 'Won' THEN 1 END) as won_leads,
        COUNT(CASE WHEN status = 'Lost' THEN 1 END) as lost_leads,
        COUNT(CASE WHEN priority = 'High' THEN 1 END) as high_priority,
        COUNT(CASE WHEN priority = 'Medium' THEN 1 END) as medium_priority,
        COUNT(CASE WHEN priority = 'Low' THEN 1 END) as low_priority
      FROM leads
    `;
    const result = await runQuery(query);
    return result[0];
  },
};

// Create table when file loads
createTable();

export default Lead;
