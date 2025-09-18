const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic account fields
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Customer", "Admin", "Tailor", "Staff"],
      default: "Customer",
    },

    // Customer profile fields
    phone: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    deliveryAddress: { type: String, trim: true, default: "" },
    billingAddress: { type: String, trim: true, default: "" },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say", ""],
      default: "",
    },
    dob: { type: Date, default: null },
    avatarUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
