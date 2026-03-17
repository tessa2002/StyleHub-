const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const measurementRoutes = require('./routes/measurements');
const profileRoutes = require('./routes/profile');
const loyaltyRoutes = require('./routes/loyalty');
const feedbackRoutes = require('./routes/feedback');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const appointmentsRoutes = require('./routes/appointments');
const fabricRoutes = require('./routes/fabrics');
const offerRoutes = require('./routes/offers');
const mlRoutes = require('./routes/ml');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS Configuration - Works for both localhost and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://stylehub-new.onrender.com',
      'http://localhost:3002' // Just in case
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

// Set global mongoose option to allow buffering
// This prevents errors if requests arrive before the initial connection is complete
mongoose.set('bufferCommands', true);

// Only connect to MongoDB if it's available, otherwise run in test mode
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Once connected, we could re-enable buffering if desired for transient disconnects
    // mongoose.set('bufferCommands', true);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('IP not whitelisted')) {
      console.log('👉 ACTION REQUIRED: Add your current IP to MongoDB Atlas Network Access');
    } else if (err.message.includes('Authentication failed')) {
      console.log('👉 ACTION REQUIRED: Check your MONGODB_URI credentials in .env');
    }
    console.log('ℹ️  Running in limited mode (Database operations will fail until connected)');
  });

// Basic Test Route
app.get('/', (req, res) => {
  res.send('🚀 Style Hub API is running!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/portal', require('./routes/portal'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/ml', mlRoutes);
app.use('/api/tailor', require('./routes/tailor'));
app.use('/api/tailors', require('./routes/tailors')); // List all tailors
app.use('/api/bills', require('./routes/bills'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/fabrics', require('./routes/fabrics'));
app.use('/api/offers', offerRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/embroidery', require('./routes/embroidery'));

// ALSO mount portal routes at /portal (for cached frontend compatibility)
app.use('/portal', require('./routes/portal'));

// Static hosting for uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// File upload routes
app.use('/api/uploads', require('./routes/uploads'));

// Catch-all route for React Router (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start Server (even if MongoDB fails)
app.listen(PORT, async () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log('⚠️  Check if MongoDB is connected above');

  // Seed default admin if none exists
  try {
    const User = require('./models/User');
    const countAdmins = await User.countDocuments({ role: 'Admin' });
    if (countAdmins === 0) {
      const bcrypt = require('bcryptjs');
      const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
      const hashed = await bcrypt.hash(password, 10);
      const admin = await User.create({
        name: 'Administrator',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@stylehub.local',
        password: hashed,
        role: 'Admin',
      });
      console.log('👤 Default admin created:', admin.email, 'password:', password);
    } else {
      console.log('👤 Admin accounts found:', countAdmins);
    }
  } catch (e) {
    console.log('⚠️  Could not seed default admin:', e.message);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err.message);
  // Don't crash the server, just log the error
});
