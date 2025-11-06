import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import {
  validateRegister,
  validateLogin,
} from "../middleware/validateInput.js";

const router = express.Router();

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Helper function to set JWT in httpOnly cookie
const setTokenCookie = (res, token) => {
  res.cookie("customerToken", token, {
    httpOnly: true, // Prevent XSS attacks
    secure: true, // Only send over HTTPS
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};
// REGISTER
router.post("/register", validateRegister, async (req, res) => {
  // Use sanitizedBody instead of req.body
  const { fullName, idNumber, accountNumber, password } = req.sanitizedBody;

  try {
    // Check if a customer already exists
    const existingUser = await Customer.findOne({
      $or: [{ idNumber }, { accountNumber }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with these details" });
    }

    // Generate a cryptographically secure salt
    const salt = await bcrypt.genSalt(12);

    // Hash password with salt using bcrypt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new customer with hashed password
    const newCustomer = new Customer({
      fullName,
      idNumber,
      accountNumber,
      password: hashedPassword,
    });

    await newCustomer.save();

    // Generate JWT token
    const token = generateToken(newCustomer._id);

    // Set cookie
    setTokenCookie(res, token);

    console.log(
      `[AUTH] New customer registered: ${fullName} (${accountNumber})`
    );

    res.status(201).json({
      token,
      message: "Registration successful",
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", validateLogin, async (req, res) => {
  // Use sanitizedBody instead of req.body
  const { fullName, accountNumber, password } = req.sanitizedBody;

  try {
    // Fetch customer including password
    const customer = await Customer.findOne({ fullName, accountNumber }).select(
      "+password"
    );

    if (!customer) {
      console.warn(
        `[AUTH] Login failed: Customer not found - ${fullName} (${accountNumber})`
      );
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Extra safety: check if password exists in DB
    if (!customer.password) {
      console.error(
        `[AUTH] Login failed: No password stored for customer ${customer._id}`
      );
      return res.status(500).json({ message: "Server error" });
    }

    // Compare plaintext password with stored hash
    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      console.warn(
        `[AUTH] Login failed: Incorrect password - ${fullName} (${accountNumber})`
      );
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(customer._id);

    // Set cookie
    setTokenCookie(res, token);

    // Return customer data without password
    const { password: _, ...customerData } = customer.toObject();

    console.log(`[AUTH] Customer logged in: ${fullName} (${accountNumber})`);

    res.json({
      token, // Also send in response for localStorage backup
      customer: customerData,
      message: "Login successful",
    });
  } catch (err) {
    console.error("[AUTH] Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// TOKEN REFRESH
router.post("/refresh", async (req, res) => {
  try {
    // Try to get token from cookie first, then from Authorization header
    const token =
      req.cookies?.customerToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the old token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Generate new token
    const newToken = generateToken(decoded.id);

    // Set new cookie
    setTokenCookie(res, newToken);

    console.log(`[AUTH] Token refreshed for customer ID: ${decoded.id}`);

    res.json({
      token: newToken,
      message: "Token refreshed successfully",
    });
  } catch (err) {
    console.error("[AUTH] Token refresh error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("customerToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  console.log("[AUTH] Customer logged out");

  res.json({ message: "Logged out successfully" });
});

export default router;
