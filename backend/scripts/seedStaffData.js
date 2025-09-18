const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function seedStaffData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create a staff user
    let staffUser = await User.findOne({ role: 'Staff' });
    if (!staffUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Staff@123', 10);
      
      staffUser = await User.create({
        name: 'John Staff',
        email: 'staff@stylehub.local',
        password: hashedPassword,
        role: 'Staff',
        phone: '+1234567890',
        address: '123 Main St, City'
      });
      console.log('Created staff user:', staffUser.email);
    }

    // Create sample customers
    const customers = [];
    for (let i = 1; i <= 5; i++) {
      let customer = await User.findOne({ email: `customer${i}@example.com` });
      if (!customer) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('Customer@123', 10);
        
        customer = await User.create({
          name: `Customer ${i}`,
          email: `customer${i}@example.com`,
          password: hashedPassword,
          role: 'Customer',
          phone: `+123456789${i}`,
          address: `${i}00 Customer St, City`
        });
      }
      customers.push(customer);
    }

    // Create sample orders assigned to staff
    const orderStatuses = ['Pending', 'Assigned', 'In Progress', 'Completed'];
    const serviceTypes = ['Shirt', 'Kurti', 'Saree Blouse', 'Pants', 'Dress'];
    const priorities = ['Low', 'Medium', 'High'];

    for (let i = 1; i <= 8; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 14) + 1);

      const existingOrder = await Order.findOne({ 
        orderNumber: `ORD-${String(i).padStart(4, '0')}` 
      });

      if (!existingOrder) {
        await Order.create({
          orderNumber: `ORD-${String(i).padStart(4, '0')}`,
          customerId: customer._id,
          customerName: customer.name,
          serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
          status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          assignedStaff: staffUser._id,
          staffId: staffUser._id,
          deliveryDate: deliveryDate,
          totalAmount: Math.floor(Math.random() * 5000) + 1000,
          measurements: {
            chest: 38 + Math.floor(Math.random() * 10),
            waist: 32 + Math.floor(Math.random() * 8),
            length: 28 + Math.floor(Math.random() * 6)
          },
          notes: `Sample order ${i} for ${customer.name}`,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Create sample appointments assigned to staff
    const appointmentServices = ['Fitting Session', 'Measurement Taking', 'Design Consultation', 'Delivery', 'Alteration'];
    
    for (let i = 1; i <= 5; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + Math.floor(Math.random() * 7));
      scheduledAt.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 4) * 15, 0, 0);

      const existingAppointment = await Appointment.findOne({
        customerId: customer._id,
        scheduledAt: scheduledAt
      });

      if (!existingAppointment) {
        await Appointment.create({
          customerId: customer._id,
          customerName: customer.name,
          service: appointmentServices[Math.floor(Math.random() * appointmentServices.length)],
          serviceType: appointmentServices[Math.floor(Math.random() * appointmentServices.length)],
          scheduledAt: scheduledAt,
          status: Math.random() > 0.3 ? 'Confirmed' : 'Pending',
          assignedStaff: staffUser._id,
          staffId: staffUser._id,
          notes: `Sample appointment ${i} with ${customer.name}`,
          createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Create sample notifications for staff
    const notificationMessages = [
      'New order assigned to you',
      'Appointment scheduled for tomorrow',
      'Order deadline approaching',
      'Customer feedback received',
      'Measurement update required'
    ];

    for (let i = 1; i <= 4; i++) {
      const existingNotification = await Notification.findOne({
        recipientId: staffUser._id,
        message: notificationMessages[i - 1]
      });

      if (!existingNotification) {
        await Notification.create({
          recipientId: staffUser._id,
          staffId: staffUser._id,
          message: notificationMessages[i - 1],
          type: ['info', 'warning', 'success'][Math.floor(Math.random() * 3)],
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          isRead: false,
          createdAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000)
        });
      }
    }

    console.log('✅ Sample staff data seeded successfully!');
    console.log(`Staff user: ${staffUser.email} (password: Staff@123)`);
    console.log('Sample orders, appointments, and notifications created.');
    
  } catch (error) {
    console.error('Error seeding staff data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder
if (require.main === module) {
  seedStaffData();
}

module.exports = seedStaffData;
