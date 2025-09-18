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

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will start without database connection');
    console.log('⚠️  Authentication and customer APIs won’t work until DB is connected');
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
app.use('/api/bills', require('./routes/bills'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/fabrics', require('./routes/fabrics'));

// Static hosting for uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload routes
app.use('/api/uploads', require('./routes/uploads'));

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
