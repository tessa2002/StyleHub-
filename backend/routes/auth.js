const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const User = require("../models/User");
const Customer = require("../models/Customer");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Google OAuth login endpoint
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ 
        success: false, 
        error: "Google credential is required" 
      });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: "Email not provided by Google" 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture || user.profilePicture;
        await user.save();
      }
    } else {
      // Create new user with Google account
      const hashedPassword = await bcrypt.hash(googleId + email, 10);
      
      // Generate a unique phone placeholder using timestamp and random number
      const uniquePhone = `google_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: hashedPassword,
        role: "Customer", // Default role for Google sign-ups
        phone: uniquePhone, // Unique placeholder phone
        googleId,
        profilePicture: picture
      });

      // Create linked Customer profile with unique phone placeholder
      try {
        await Customer.create({
          name: user.name,
          email: user.email,
          phone: uniquePhone, // Same unique placeholder
          address: "",
          user: user._id
        });
      } catch (customerError) {
        // If customer creation fails, delete the user and return error
        await User.findByIdAndDelete(user._id);
        console.error("❌ Customer creation error:", customerError);
        return res.status(500).json({ 
          success: false, 
          error: "Failed to create customer profile" 
        });
      }
    }

    // Generate JWT token
    const jwtPayload = { id: user._id, role: user.role };
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error("❌ Google OAuth error:", error);
    
    if (error.message && error.message.includes('Token used too early')) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid Google token timing" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Google authentication failed" 
    });
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
