import User from "../models/user.model.js";

// Get all users with optional role filtering
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let users;
    if (role) {
      users = await User.getByRole(role);
    } else {
      users = await User.getAll();
    }

    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.getById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user exists
    const existingUser = await User.getById(id);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update user
    const updatedUser = await User.update(id, updateData);

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await User.getById(id);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Delete user
    await User.delete(id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
