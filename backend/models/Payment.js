import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    provider: { type: String, default: "SWIFT" },
    payeeAccount: { type: String, required: true },
    swiftCode: { type: String, required: true },
    status: { type: String, default: "Pending" }, 
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
