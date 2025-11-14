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

// Create users table
const createTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'sales_executive',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Add status column if it doesn't exist
  const addStatusColumnQuery = `
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'
  `;

  try {
    await runQuery(createTableQuery);
    await runQuery(addStatusColumnQuery);
    console.log("Users table ready");
  } catch (error) {
    console.error("Error creating table:", error.message);
  }
};

const User = {
  // Add new user
  // roles are like 'admin', 'manager', 'sales_executive', etc.
  add: async (
    name,
    email,
    password,
    role = "sales_executive",
    status = "active"
  ) => {
    const query =
      "INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const result = await runQuery(query, [name, email, password, role, status]);
    return result[0];
  },

  // Get all users
  getAll: async () => {
    const query = "SELECT id, name, email, role, status, created_at FROM users";
    return await runQuery(query);
  },

  // Get user by email
  getByEmail: async (email) => {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await runQuery(query, [email]);
    return result[0];
  },

  // Get user by id
  getById: async (id) => {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await runQuery(query, [id]);
    return result[0];
  },

  // Get users by role
  getByRole: async (role) => {
    const query =
      "SELECT id, name, email, role, status, created_at FROM users WHERE role = $1";
    return await runQuery(query, [role]);
  },

  // Update user
  update: async (id, updateData) => {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    // Build SET clause dynamically
    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");

    const query = `UPDATE users SET ${setClause} WHERE id = $${
      fields.length + 1
    } RETURNING id, name, email, role, status, created_at`;
    const result = await runQuery(query, [...values, id]);
    return result[0];
  },

  // Delete user
  delete: async (id) => {
    const query = "DELETE FROM users WHERE id = $1";
    await runQuery(query, [id]);
    return true;
  },
};

// Create table when file loads
createTable();

export default User;
