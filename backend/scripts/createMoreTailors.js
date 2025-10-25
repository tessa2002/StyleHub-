require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function createMoreTailors() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/style_hub';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Define new tailors to create
    const newTailors = [
      { name: 'Rajesh Kumar', email: 'rajesh@stylehub.com', password: 'Tailor@123' },
      { name: 'Priya Sharma', email: 'priya@stylehub.com', password: 'Tailor@123' },
      { name: 'Amit Patel', email: 'amit@stylehub.com', password: 'Tailor@123' },
    ];

    console.log('\n🔧 Creating new tailors...\n');

    for (const tailorData of newTailors) {
      // Check if tailor already exists
      const existing = await User.findOne({ email: tailorData.email });
      if (existing) {
        console.log(`   ⚠️  ${tailorData.name} (${tailorData.email}) - Already exists, skipping`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(tailorData.password, 10);

      // Create tailor
      const tailor = await User.create({
        name: tailorData.name,
        email: tailorData.email,
        password: hashedPassword,
        role: 'Tailor',
        phone: '9999999999'
      });

      console.log(`   ✅ ${tailor.name} (${tailor.email}) - Created successfully`);
    }

    // Show all tailors
    const allTailors = await User.find({ role: 'Tailor' }).select('name email');
    console.log('\n📋 All Tailors in System: ' + allTailors.length);
    allTailors.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.name} (${t.email})`);
    });

    console.log('\n🔐 Login Credentials for New Tailors:');
    console.log('   Password for all: Tailor@123');
    
    console.log('\n✅ Complete! You can now assign orders to multiple tailors.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createMoreTailors();

