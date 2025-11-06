import express from "express";
import Payment from "../models/Payment.js";
import { protect } from "../middleware/auth.js";
import { validatePayment } from "../middleware/validateInput.js";

const router = express.Router();

// MAKE PAYMENT
router.post("/make-payment", protect, validatePayment, async (req, res) => {
  try {
    // Use sanitizedBody instead of req.body
    const { amount, currency, payeeAccount, swiftCode } = req.sanitizedBody;

    console.log(
      "[SANITIZE] sanitizedBody used for make-payment:",
      req.sanitizedBody
    );

    const payment = new Payment({
      customerId: req.user.id,
      amount,
      currency,
      provider: "SWIFT",
      payeeAccount,
      swiftCode,
      status: "Pending",
    });

    await payment.save();

    console.log(
      `[PAYMENT] New payment created: ${amount} ${currency} to ${payeeAccount} (Customer: ${req.user.id})`
    );

    res.status(201).json({
      message: "Payment successfully processed via SWIFT!",
      payment,
    });
  } catch (error) {
    console.error("[PAYMENT] Payment creation error:", error);
    res.status(500).json({ message: "Server error while processing payment" });
  }
});

// GET CUSTOMER PAYMENTS
router.get("/customer-payments", protect, async (req, res) => {
  try {
    const payments = await Payment.find({ customerId: req.user.id }).sort({
      createdAt: -1,
    });

    console.log(
      `[PAYMENT] Fetched ${payments.length} payments for customer ${req.user.id}`
    );

    res.json(payments);
  } catch (error) {
    console.error("[PAYMENT] Error fetching customer payments:", error);
    res.status(500).json({ message: "Failed to fetch your payments" });
  }
});

export default router;
