require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

console.log('🔍 Testing MongoDB Atlas connection...');
console.log('📝 Connection string:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
console.log('');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 15000,
  connectTimeoutMS: 15000
})
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection FAILED:');
    console.error('');
    console.error('Error Type:', err.name);
    console.error('Error Message:', err.message);
    console.error('');
    
    if (err.message.includes('authentication failed')) {
      console.error('💡 SOLUTION: Wrong password!');
      console.error('   1. Go to MongoDB Atlas → Database Access');
      console.error('   2. Find user "stylehub"');
      console.error('   3. Verify password is "tessa123"');
      console.error('   4. Or update .env with correct password');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('💡 SOLUTION: Cannot reach MongoDB Atlas cluster!');
      console.error('   1. Go to MongoDB Atlas → Clusters');
      console.error('   2. Check if cluster is RUNNING (green status)');
      console.error('   3. If paused, click "Resume"');
    } else if (err.message.includes('IP') || err.message.includes('whitelist')) {
      console.error('💡 SOLUTION: Your IP address is not whitelisted!');
      console.error('   1. Go to MongoDB Atlas → Network Access');
      console.error('   2. Click "Add IP Address"');
      console.error('   3. Click "Add Current IP Address"');
      console.error('   4. Or allow all: 0.0.0.0/0 (for testing only)');
    } else if (err.message.includes('timeout')) {
      console.error('💡 SOLUTION: Connection timeout!');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify MongoDB Atlas cluster is running');
      console.error('   3. Check firewall/antivirus blocking connection');
    }
    
    console.error('');
    console.error('Full error details:');
    console.error(err);
    process.exit(1);
  });


