import express from "express";
import Employee from "../models/Employee.js";
import Payment from "../models/Payment.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { protect } from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Helper function to set JWT in httpOnly cookie
const setTokenCookie = (res, token) => {
  res.cookie("employeeToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};

// EMPLOYEE LOGIN
router.post("/login", async (req, res) => {
  // Use sanitizedBody
  const { username, password } = req.sanitizedBody;

  try {
    const employee = await Employee.findOne({ username });
    if (!employee) {
      console.warn(`[EMPLOYEE] Login failed: Employee not found - ${username}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      console.warn(`[EMPLOYEE] Login failed: Incorrect password - ${username}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(employee._id);

    // Set cookie
    setTokenCookie(res, token);

    console.log(`[EMPLOYEE] Employee logged in: ${username}`);

    res.json({ token, message: "Login successful" });
  } catch (err) {
    console.error("[EMPLOYEE] Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// EMPLOYEE LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("employeeToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  console.log("[EMPLOYEE] Employee logged out");

  res.json({ message: "Logged out successfully" });
});

// GET PENDING PAYMENTS
router.get("/transactions", protect, async (req, res) => {
  try {
    const payments = await Payment.find({ status: "Pending" }).populate(
      "customerId",
      "fullName idNumber"
    );

    console.log(`[EMPLOYEE] Fetched ${payments.length} pending transactions`);

    res.json(payments);
  } catch (err) {
    console.error("[EMPLOYEE] Error fetching transactions:", err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// SUBMIT TO SWIFT
router.post("/submit-swift", protect, async (req, res) => {
  // Use sanitizedBody
  const { transactions } = req.sanitizedBody;

  console.log(
    "[SANITIZE] sanitizedBody used for submit-swift:",
    req.sanitizedBody
  );

  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const result = await Payment.updateMany(
      { _id: { $in: transactions } },
      { $set: { status: "Submitted" } }
    );

    console.log(
      `[EMPLOYEE] Submitted ${result.modifiedCount} transactions to SWIFT`
    );

    res.json({
      message: "Verified transactions submitted to SWIFT successfully",
      count: result.modifiedCount,
    });
  } catch (err) {
    console.error("[EMPLOYEE] Error submitting to SWIFT:", err);
    res.status(500).json({ message: "Failed to submit transactions" });
  }
});

export default router;
