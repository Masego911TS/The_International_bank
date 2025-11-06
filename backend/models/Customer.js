import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    idNumber: { type: String, required: true, unique: true },
    accountNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, //hide password by default
  },
  { timestamps: true }
);

//Remove password from JSON output automatically
customerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
