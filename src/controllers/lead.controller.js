import Lead from "../models/lead.model.js";

// Create a new lead
export const createLead = async (req, res) => {
  try {
    const { leadname, company, email, mobile, priority, status } = req.body;
    const { userId, role } = req.user;

    // Check if user is authorized to create leads
    if (role !== "admin" && role !== "manager" && role !== "sales_executive") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to create leads",
      });
    }

    // Check required fields
    if (!leadname) {
      return res.status(400).json({
        success: false,
        message: "Lead name  are required",
      });
    }

    // Validate priority if provided
    const validPriorities = ["High", "Medium", "Low"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be High, Medium, or Low",
      });
    }

    // Validate status if provided
    const validStatuses = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal",
      "Negotiation",
      "Won",
      "Lost",
    ];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Check if email already exists (if email is provided)
    if (email) {
      const existingLead = await Lead.getByEmail(email);
      if (existingLead) {
        return res.status(400).json({
          success: false,
          message: "Lead with this email already exists",
        });
      }
    }

    // Create lead
    const newLead = await Lead.add(
      leadname,
      company,
      email,
      mobile,
      priority,
      status,
      userId // owner_id is userId from authenticated user
    );

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: newLead,
    });
  } catch (error) {
    console.error("Create lead error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create lead",
      error: error.message,
    });
  }
};

// Get all leads
export const getAllLeads = async (req, res) => {
  try {
    const { status, priority, owner_id } = req.query;
    let leads;

    // Filter based on query parameters
    if (status) {
      leads = await Lead.getByStatus(status);
    } else if (priority) {
      leads = await Lead.getByPriority(priority);
    } else if (owner_id) {
      leads = await Lead.getByOwnerId(owner_id);
    } else {
      leads = await Lead.getAll();
    }

    res.status(200).json({
      success: true,
      message: "Leads retrieved successfully",
      data: leads,
      count: leads.length,
    });
  } catch (error) {
    console.error("Get all leads error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve leads",
      error: error.message,
    });
  }
};

// Get lead by ID
export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid lead ID is required",
      });
    }

    const lead = await Lead.getById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead retrieved successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Get lead by ID error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve lead",
      error: error.message,
    });
  }
};

// Update lead
export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid lead ID is required",
      });
    }

    // Check if lead exists
    const existingLead = await Lead.getById(id);
    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Validate updates
    const allowedFields = [
      "leadname",
      "company",
      "email",
      "mobile",
      "priority",
      "status",
      "owner_id",
    ];
    const updateFields = {};

    for (const field in updates) {
      if (allowedFields.includes(field)) {
        updateFields[field] = updates[field];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    // Validate priority if being updated
    if (updateFields.priority) {
      const validPriorities = ["High", "Medium", "Low"];
      if (!validPriorities.includes(updateFields.priority)) {
        return res.status(400).json({
          success: false,
          message: "Priority must be High, Medium, or Low",
        });
      }
    }

    // Validate status if being updated
    if (updateFields.status) {
      const validStatuses = [
        "New",
        "Contacted",
        "Qualified",
        "Proposal",
        "Negotiation",
        "Won",
        "Lost",
      ];
      if (!validStatuses.includes(updateFields.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }
    }

    // Check email uniqueness if email is being updated
    if (updateFields.email && updateFields.email !== existingLead.email) {
      const emailExists = await Lead.getByEmail(updateFields.email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Lead with this email already exists",
        });
      }
    }

    // Update lead
    const updatedLead = await Lead.update(id, updateFields);

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Update lead error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update lead",
      error: error.message,
    });
  }
};

// Update lead status
export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid lead ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Validate status
    const validStatuses = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal",
      "Negotiation",
      "Won",
      "Lost",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Check if lead exists
    const existingLead = await Lead.getById(id);
    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Update status
    const updatedLead = await Lead.updateStatus(id, status);

    res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Update lead status error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update lead status",
      error: error.message,
    });
  }
};

// Update lead priority
export const updateLeadPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid lead ID is required",
      });
    }

    if (!priority) {
      return res.status(400).json({
        success: false,
        message: "Priority is required",
      });
    }

    // Validate priority
    const validPriorities = ["High", "Medium", "Low"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be High, Medium, or Low",
      });
    }

    // Check if lead exists
    const existingLead = await Lead.getById(id);
    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Update priority
    const updatedLead = await Lead.updatePriority(id, priority);

    res.status(200).json({
      success: true,
      message: "Lead priority updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Update lead priority error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update lead priority",
      error: error.message,
    });
  }
};

// Delete lead
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid lead ID is required",
      });
    }

    // Check if lead exists
    const existingLead = await Lead.getById(id);
    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Delete lead
    await Lead.delete(id);

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete lead error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete lead",
      error: error.message,
    });
  }
};

// Get leads by owner (for sales executives)
export const getMyLeads = async (req, res) => {
  try {
    // Assuming the user ID comes from auth middleware
    const { userId } = req.user || req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const leads = await Lead.getByOwnerId(userId);

    res.status(200).json({
      success: true,
      message: "Your leads retrieved successfully",
      data: leads,
      count: leads.length,
    });
  } catch (error) {
    console.error("Get my leads error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your leads",
      error: error.message,
    });
  }
};

// Get lead statistics
export const getLeadStats = async (req, res) => {
  try {
    const stats = await Lead.getStats();

    res.status(200).json({
      success: true,
      message: "Lead statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Get lead stats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve lead statistics",
      error: error.message,
    });
  }
};
