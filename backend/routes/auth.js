const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Customer = require("../models/Customer");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Register endpoint (test-friendly version)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "Customer";

    // Create user
    const user = await User.create({ name, email, password: hashedPassword, role, phone: phone || "" });

    // If role is Customer, create a linked Customer profile
    if (role === "Customer") {
      try {
        await Customer.create({ name, email, phone: phone || "", address: "", user: user._id });
      } catch (e) {
        // If phone is missing or duplicate, cleanup and return a clear error
        await User.findByIdAndDelete(user._id);
        const msg = e?.code === 11000 ? "Phone already exists for another customer" : (e.message || "Failed to create customer profile");
        return res.status(400).json({ message: msg });
      }
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Verify endpoint
router.get("/verify", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("❌ Verify error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
