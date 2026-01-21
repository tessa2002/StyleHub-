const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function listUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({}, 'name email role status');
    console.log('\nAll Users:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) [Role: ${u.role}, Status: ${u.status}]`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();
