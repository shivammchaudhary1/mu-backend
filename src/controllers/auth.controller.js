import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../config/lib/bcrypt.js";
import { generateToken } from "../config/lib/jwt.js";

// Register function
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if user exists
    const existingUser = await User.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await User.add(name, email, hashedPassword, role);

    // Create token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// Login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
