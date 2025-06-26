const mongoose = require("mongoose");

const PayrollSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
    },
    overtime: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    deductions: [
      {
        amount: Number,
        reason: String,
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    paymentMethod: String,
    netPay: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payroll", PayrollSchema);
