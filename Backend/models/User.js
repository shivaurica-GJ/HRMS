const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "hr", "employee"],
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: String,
    designation: String,
    department: String,
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    businessName: String,
    gstNumber: String,
    businessAddress: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.virtual("employee", {
  ref: "Employee",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

module.exports = mongoose.model("User", UserSchema);
