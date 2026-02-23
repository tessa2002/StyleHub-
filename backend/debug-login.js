require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const email = 'milka@gmail.com';

async function debugLogin() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        console.log(`🔍 Searching for user: ${email}...`);
        try {
            const user = await User.findOne({ email });
            if (!user) {
                console.log('ℹ️ User not found.');
            } else {
                console.log('✅ User found:', { id: user._id, email: user.email, role: user.role });
                console.log('🔑 Password hash length:', user.password ? user.password.length : 'MISSING');

                if (user.password) {
                    console.log('🧪 Testing bcrypt.compare...');
                    // The password for milka@gmail.com is usually 'password123' in these demos or what the user tried.
                    // Wait, I don't know the password. I'll just try to compare with 'dummy' to see if it throws.
                    try {
                        const match = await bcrypt.compare('dummy', user.password);
                        console.log('✅ bcrypt.compare worked (returned ' + match + ')');
                    } catch (bcryptErr) {
                        console.error('❌ bcrypt.compare THREW ERROR:', bcryptErr);
                    }
                }
            }
        } catch (dbErr) {
            console.error('❌ DB Query Error:', dbErr);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Debug script failed:', err);
        process.exit(1);
    }
}

debugLogin();
