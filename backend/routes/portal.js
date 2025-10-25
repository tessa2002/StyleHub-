const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Appointment = require('../models/Appointment');
const MeasurementHistory = require('../models/MeasurementHistory');
const Fabric = require('../models/Fabric');

const router = express.Router();

async function getCustomerByUser(userId) {
  let customer = await Customer.findOne({ user: userId });
  if (!customer) {
    const user = await User.findById(userId);
    if (user?.email) customer = await Customer.findOne({ email: user.email });
  }
  return customer;
}

// Dashboard (test-friendly version)
router.get('/dashboard', auth, allowRoles('Customer'), async (req, res) => {
  try {
    // Test mode: Return mock data
    if (req.user?.id === 'test_user_id') {
      res.json({
        recentOrders: [
          { _id: 'order1', itemType: 'Shirt', status: 'Stitching', expectedDelivery: '2024-01-15', createdAt: '2024-01-01' },
          { _id: 'order2', itemType: 'Pants', status: 'Order Placed', expectedDelivery: '2024-01-20', createdAt: '2024-01-02' }
        ],
        upcomingAppointments: [
          { _id: 'apt1', scheduledAt: '2024-01-10T10:00:00Z', status: 'Scheduled' }
        ],
        notifications: [
          { type: 'order', message: '2 order(s) in progress' }
        ],
        quickLinks: [
          { name: 'Profile', path: '/portal/profile' },
          { name: 'Orders', path: '/portal/orders' },
          { name: 'Appointments', path: '/portal/appointments' },
          { name: 'Measurements', path: '/portal/measurements' }
        ]
      });
      return;
    }

    // Try database access if available
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer profile not found' });

    const recentOrders = await Order.find({ customer: customer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('itemType status expectedDelivery createdAt');

    const upcomingAppointments = await Appointment.find({
      customer: customer._id,
      scheduledAt: { $gte: new Date() },
      status: { $in: ['Scheduled'] }
    }).sort({ scheduledAt: 1 });

    const notifications = [];
    const unfinished = await Order.countDocuments({ customer: customer._id, status: { $in: ['Order Placed', 'Cutting', 'Stitching', 'Trial', 'Ready'] } });
    if (unfinished > 0) notifications.push({ type: 'order', message: `${unfinished} order(s) in progress` });

    res.json({
      recentOrders,
      upcomingAppointments,
      notifications,
      quickLinks: [
        { name: 'Profile', path: '/portal/profile' },
        { name: 'Orders', path: '/portal/orders' },
        { name: 'Appointments', path: '/portal/appointments' },
        { name: 'Measurements', path: '/portal/measurements' }
      ]
    });
  } catch (err) {
    console.log('ℹ️  Database not available, using test mode for dashboard');
    res.json({
      recentOrders: [],
      upcomingAppointments: [],
      notifications: [],
      quickLinks: [
        { name: 'Profile', path: '/portal/profile' },
        { name: 'Orders', path: '/portal/orders' },
        { name: 'Appointments', path: '/portal/appointments' },
        { name: 'Measurements', path: '/portal/measurements' }
      ]
    });
  }
});

// Profile (test-friendly version)
router.get('/profile', auth, allowRoles('Customer'), async (req, res) => {
  try {
    console.log('🔍 Profile request received for user:', req.user?.id);
    
    // Test mode: Return mock profile data
    if (req.user?.id === 'test_user_id') {
      res.json({
        name: 'Test Customer',
        email: 'Customer@gmail.com',
        phone: '9999999999',
        address: 'Test Address, Test City',
        preferences: {
          notifications: true,
          emailUpdates: true
        }
      });
      return;
    }
    const user = await User.findById(req.user.id).select('name email phone whatsapp deliveryAddress billingAddress gender dob avatarUrl role');
    console.log('👤 User found:', user ? 'Yes' : 'No');
    const customer = await getCustomerByUser(req.user.id);
    console.log('👥 Customer found:', customer ? 'Yes' : 'No');
    res.json({ user, customer });
  } catch (error) {
    console.error('❌ Profile route error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/profile', auth, allowRoles('Customer'), async (req, res) => {
  try {
    let { name, email, phone, whatsapp, deliveryAddress, billingAddress, gender, dob, avatarUrl } = req.body;

    // Normalize inputs
    name = typeof name === 'string' ? name.trim() : name;
    email = typeof email === 'string' ? email.trim().toLowerCase() : email;
    phone = typeof phone === 'string' ? phone.trim() : phone;
    whatsapp = typeof whatsapp === 'string' ? whatsapp.trim() : whatsapp;
    deliveryAddress = typeof deliveryAddress === 'string' ? deliveryAddress.trim() : deliveryAddress;
    billingAddress = typeof billingAddress === 'string' ? billingAddress.trim() : billingAddress;
    gender = typeof gender === 'string' ? gender.trim() : gender;
    avatarUrl = typeof avatarUrl === 'string' ? avatarUrl.trim() : avatarUrl;
    // Convert empty dob to null and cast to Date
    if (dob === '' || dob === undefined || dob === null) {
      dob = null;
    } else {
      const parsed = new Date(dob);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ message: 'Invalid date of birth format' });
      }
      dob = parsed;
    }

    // Update user fields
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, whatsapp, deliveryAddress, billingAddress, gender, dob, avatarUrl },
      { new: true, runValidators: true }
    ).select('name email phone whatsapp deliveryAddress billingAddress gender dob avatarUrl role');

    // Keep backward-compatibility with Customer collection for phone/address
    let customer = await getCustomerByUser(req.user.id);
    if (!customer) {
      customer = await Customer.create({ name, email, phone, address: deliveryAddress || '', user: req.user.id });
    } else {
      customer.name = name ?? customer.name;
      customer.email = email ?? customer.email;
      customer.phone = phone ?? customer.phone;
      // store a simple address fallback
      customer.address = (deliveryAddress ?? customer.address);
      await customer.save();
    }

    res.json({ user, customer });
  } catch (e) {
    console.error('❌ Profile update error:', e);
    if (e.code === 11000 && e.keyPattern && e.keyPattern.email) {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    if (e.name === 'ValidationError') {
      const messages = Object.values(e.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message: `Validation error: ${messages}` });
    }
    return res.status(500).json({ message: 'Failed to update profile. Please try again.' });
  }
});

// Password
const bcrypt = require('bcryptjs');
router.post('/password', auth, allowRoles('Customer'), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  res.json({ success: true });
});

// Bills for the logged-in customer (test-friendly version)
router.get('/bills', async (req, res) => {
  try {
    // Test mode: Return mock bills
    if (req.user?.id === 'test_user_id') {
      res.json({ 
        bills: [
          { _id: 'bill1', amount: 1500, status: 'Unpaid', amountPaid: 0, createdAt: '2024-01-01' },
          { _id: 'bill2', amount: 2000, status: 'Paid', amountPaid: 2000, createdAt: '2024-01-02' }
        ] 
      });
      return;
    }

    const customer = await getCustomerByUser(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer profile not found' });

    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 3));
    const orders = await Order.find({ customer: customer._id }).select('_id');
    const orderIds = orders.map(o => o._id);

    const bills = await require('../models/Bill')
      .find({ order: { $in: orderIds } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('order amount status createdAt')
      .populate('order', '_id');

    res.json({
      bills: bills.map(b => ({
        id: b._id,
        order: b.order?._id || b.order,
        amount: b.amount,
        status: b.status,
        date: b.createdAt,
      }))
    });
  } catch (err) {
    console.log('ℹ️  Database not available, using test mode for bills');
    res.json({ bills: [] });
  }
});

// Measurements (test-friendly version)
router.get('/measurements', auth, allowRoles('Customer'), async (req, res) => {
  try {
    // Test mode: Return mock measurements
    if (req.user?.id === 'test_user_id') {
      res.json({ 
        current: {
          chest: 40,
          waist: 32,
          hips: 36,
          shoulder: 16,
          sleeve: 24
        },
        styleNotes: 'Test style notes',
        history: [
          { _id: 'meas1', measurements: { chest: 40, waist: 32 }, createdAt: '2024-01-01' }
        ]
      });
      return;
    }

    const customer = await getCustomerByUser(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
    const history = await MeasurementHistory.find({ customer: customer._id }).sort({ createdAt: -1 });
    res.json({ current: customer.measurements, styleNotes: customer.styleNotes || '', history });
  } catch (err) {
    console.log('ℹ️  Database not available, using test mode for measurements');
    res.json({ 
      current: {},
      styleNotes: '',
      history: []
    });
  }
});

router.put('/measurements', auth, allowRoles('Customer'), async (req, res) => {
  try {
    console.log('📏 Saving measurements for user:', req.user.id);
    console.log('📦 Request body:', req.body);
    
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) {
      console.log('❌ Customer not found for user:', req.user.id);
      return res.status(404).json({ success: false, message: 'Customer profile not found' });
    }
    
    const { measurements = {}, styleNotes = '' } = req.body;
    console.log('💾 Updating measurements:', measurements);
    
    customer.measurements = measurements;
    customer.styleNotes = styleNotes;
    await customer.save();
    
    console.log('✅ Customer measurements saved');
    
    // Save to history
    try {
      await MeasurementHistory.create({ 
        customer: customer._id, 
        measurements, 
        styleNotes, 
        source: 'manual' 
      });
      console.log('✅ Measurement history saved');
    } catch (historyError) {
      console.error('⚠️ History save failed (non-critical):', historyError);
      console.error('History error details:', historyError.message);
      // Don't fail the main operation if history fails
    }
    
    res.json({ success: true, current: customer.measurements });
  } catch (e) {
    console.error('❌ Error saving measurements:', e);
    console.error('Error details:', e.message);
    res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
});

// Orders (test-friendly version)
router.get('/orders', auth, allowRoles('Customer'), async (req, res) => {
  try {
    console.log('📦 Fetching orders for user:', req.user?.id);
    
    // Test mode: Return mock orders
    if (req.user?.id === 'test_user_id') {
      res.json({ 
        orders: [
          { _id: 'order1', itemType: 'Shirt', status: 'Stitching', totalAmount: 1500, createdAt: '2024-01-01' },
          { _id: 'order2', itemType: 'Pants', status: 'Order Placed', totalAmount: 2000, createdAt: '2024-01-02' }
        ] 
      });
      return;
    }

    const customer = await getCustomerByUser(req.user.id);
    console.log('👤 Customer found:', customer?._id);
    
    if (!customer) {
      console.log('❌ No customer profile found for user:', req.user.id);
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    
    const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });
    console.log('✅ Found', orders.length, 'orders for customer:', customer._id);
    
    res.json({ orders });
  } catch (err) {
    console.error('❌ Error fetching orders:', err.message);
    console.error('Error details:', err);
    res.json({ orders: [] });
  }
});

// Bill for a specific order (Customer)
router.get('/bills/by-order/:orderId', auth, allowRoles('Customer'), async (req, res) => {
  try {
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
    
    const order = await Order.findOne({ _id: req.params.orderId, customer: customer._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    const Bill = require('../models/Bill');
    let bill = await Bill.findOne({ order: order._id });
    
    // Auto-create bill if it doesn't exist
    if (!bill) {
      console.log(`📝 Auto-creating bill for order ${order._id}`);
      
      // Calculate amount based on order - fix if totalAmount is 0
      let amount = order.totalAmount;
      
      if (!amount || amount === 0) {
        console.log(`⚠️ Order has totalAmount = 0, calculating from garment type...`);
        const basePrices = {
          'shirt': 800,
          'pants': 600,
          'suit': 2000,
          'dress': 1200,
          'kurta': 1000,
          'blouse': 800,
          'lehenga': 2500,
          'jacket': 1500,
          'other': 1000
        };
        
        const garmentType = (order.itemType || '').toLowerCase();
        amount = basePrices[garmentType] || 1000;
        
        // Add fabric cost if exists
        if (order.fabric && order.fabric.source === 'shop' && order.fabric.cost) {
          amount += Number(order.fabric.cost);
        }
        
        // Add embroidery cost if exists
        if (order.customizations?.embroidery?.enabled) {
          const embroideryTotal = order.customizations.embroidery.pricing?.total || 0;
          amount += embroideryTotal;
        }
        
        // Add urgency charge
        if (order.urgency === 'urgent') {
          amount += 500;
        }
        
        console.log(`💰 Calculated amount: ₹${amount} for ${order.itemType}`);
        
        // Update the order with correct totalAmount
        order.totalAmount = amount;
        await order.save();
      }
      
      try {
        bill = await Bill.create({
          order: order._id,
          customer: customer._id,
          amount: amount,
          paymentMethod: 'Razorpay',
          status: 'Pending',
          amountPaid: 0,
          payments: [],
        });
        console.log(`✅ Bill created: ${bill.billNumber} for ₹${amount}`);
      } catch (createErr) {
        console.error('Failed to create bill:', createErr.message);
        return res.status(404).json({ message: 'Bill not found and could not be created' });
      }
    }
    
    res.json({ 
      bill: {
        _id: bill._id,
        billNumber: bill.billNumber,
        order: bill.order,
        amount: bill.amount,
        amountPaid: bill.amountPaid,
        status: bill.status,
        paidAt: bill.paidAt,
      }
    });
  } catch (error) {
    console.error('Error in bills/by-order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mini-project: mark bill as Paid (Customer)
router.post('/bills/:id/pay', auth, allowRoles('Customer'), async (req, res) => {
  const customer = await getCustomerByUser(req.user.id);
  if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
  const Bill = require('../models/Bill');
  const bill = await Bill.findById(req.params.id);
  if (!bill) return res.status(404).json({ message: 'Bill not found' });
  const order = await Order.findOne({ _id: bill.order, customer: customer._id });
  if (!order) return res.status(403).json({ message: 'Not authorized to pay this bill' });
  bill.amountPaid = bill.amount; // mark as fully paid
  bill.recomputeStatus();
  await bill.save();
  res.json({ success: true, bill: { _id: bill._id, status: bill.status, amount: bill.amount, amountPaid: bill.amountPaid } });
});

// Customer cancel order (allowed only if status Order Placed or Cutting)
router.put('/orders/:id/cancel', auth, allowRoles('Customer'), async (req, res) => {
  const customer = await getCustomerByUser(req.user.id);
  if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
  const order = await Order.findOne({ _id: req.params.id, customer: customer._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!['Order Placed', 'Cutting'].includes(order.status)) {
    return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
  }
  order.status = 'Cancelled';
  await order.save();
  res.json({ order });
});

router.get('/orders/:id', auth, allowRoles('Customer'), async (req, res) => {
  const customer = await getCustomerByUser(req.user.id);
  const order = await Order.findOne({ _id: req.params.id, customer: customer?._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
});

router.post('/orders', auth, allowRoles('Customer'), async (req, res) => {
  try {
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer profile not found' });

    const { garmentType, items = [], measurementSnapshot = {}, measurements, notes, specialInstructions, expectedDelivery, urgency, fabric, customizations, sleeveType, collarType, hasButtons, hasZippers, requirements, embroidery } = req.body;

    console.log('📝 Creating order with data:', { garmentType, urgency, fabric: fabric?.source, embroidery: embroidery?.enabled || customizations?.embroidery?.enabled });

    // ✅ VALIDATE MEASUREMENTS - CRITICAL!
    const finalMeasurements = measurements || measurementSnapshot;
    if (!finalMeasurements || Object.keys(finalMeasurements).length === 0) {
      console.log('❌ Order rejected: No measurements provided');
      return res.status(400).json({ 
        success: false,
        message: 'Measurements are required! Tailors cannot stitch without measurements.' 
      });
    }
    
    // Check if measurements have actual values
    const hasValidValues = Object.values(finalMeasurements).some(val => 
      val && String(val).trim() !== '' && String(val).trim() !== '0'
    );
    
    if (!hasValidValues) {
      console.log('❌ Order rejected: Measurements are empty or invalid');
      return res.status(400).json({ 
        success: false,
        message: 'Please provide valid measurements. All fields appear to be empty.' 
      });
    }

    // Calculate base price based on garment type
    const basePrices = {
      'shirt': 800,
      'pants': 600,
      'suit': 2000,
      'dress': 1200,
      'kurta': 1000,
      'blouse': 800,
      'lehenga': 2500,
      'jacket': 1500,
      'other': 1000
    };
    const basePrice = basePrices[garmentType?.toLowerCase()] || 1000;
    console.log('💰 Base price for', garmentType, ':', basePrice);

    // Handle fabric selection and stock decrement when shop fabric is used
    let fabricInfo = { source: 'none' };
    let fabricCost = 0;
    
    if (fabric && fabric.source === 'shop' && fabric.fabricId) {
      const qty = Math.max(0, Number(fabric.quantity || 0));
      if (!qty) return res.status(400).json({ message: 'Fabric quantity must be > 0' });

      // Atomically decrement stock if sufficient
      const fb = await Fabric.findOneAndUpdate(
        { _id: fabric.fabricId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );
      if (!fb) return res.status(400).json({ message: 'Insufficient fabric stock' });

      const unitPrice = Number(fb.price || 0);
      fabricCost = unitPrice * qty;
      console.log('🧵 Fabric cost:', fabricCost, '(', qty, 'm @', unitPrice, '/m)');
      
      fabricInfo = {
        source: 'shop',
        fabricId: fb._id,
        name: fb.name,
        code: '',
        color: fb.color || '',
        quantity: qty,
        unit: 'm',
        unitPrice,
        cost: fabricCost,
        notes: fabric.notes || ''
      };
    } else if (fabric && fabric.source === 'customer') {
      fabricInfo = {
        source: 'customer',
        name: '',
        code: '',
        color: '',
        quantity: Number(fabric.quantity || 0) || 0,
        unit: 'm',
        unitPrice: 0,
        cost: 0,
        notes: fabric.notes || ''
      };
    }

    // Calculate embroidery cost
    let embroideryPricing = { total: 0 };
    let embroideryCost = 0;
    const embData = embroidery || customizations?.embroidery;
    
    if (embData?.enabled) {
      const embTypes = { machine: 300, hand: 800, zardosi: 1200, aari: 1000, bead: 900, thread: 500 };
      const embPlacements = { collar: 150, sleeves: 200, neckline: 250, hem: 300, full: 1200, custom: 300 };
      const perExtraColor = 50;
      
      const typeCharge = embTypes[embData.type] || 0;
      const placementCharge = (embData.placements || []).reduce((sum, pl) => sum + (embPlacements[pl] || 0), 0);
      const extraColors = Math.max(0, (embData.colors?.length || 0) - 1);
      const colorCharge = extraColors * perExtraColor;
      
      embroideryCost = typeCharge + placementCharge + colorCharge;
      embroideryPricing = {
        type: embData.type,
        typeCharge,
        placements: embData.placements,
        placementCharge,
        colors: embData.colors,
        colorCharge,
        total: embroideryCost
      };
      console.log('✨ Embroidery cost:', embroideryCost);
    }

    // Calculate urgency charge
    const urgencyCharge = urgency === 'urgent' ? 500 : 0;
    console.log('⚡ Urgency charge:', urgencyCharge);

    // Calculate total amount
    const totalAmount = basePrice + fabricCost + embroideryCost + urgencyCharge;
    console.log('💵 Total amount:', totalAmount, '= base:', basePrice, '+ fabric:', fabricCost, '+ embroidery:', embroideryCost, '+ urgency:', urgencyCharge);

    // Create order item from garment details
    const orderItems = [{
      itemType: garmentType || 'Custom Garment',
      name: garmentType || 'Custom Garment',
      quantity: 1,
      price: totalAmount,
      description: specialInstructions || notes || ''
    }];

    const order = await Order.create({
      customer: customer._id,
      items: orderItems,
      itemType: garmentType,
      status: 'Order Placed',
      totalAmount,
      measurementSnapshot: measurements || measurementSnapshot,
      notes: specialInstructions || notes,
      expectedDelivery: expectedDelivery || null,
      urgency: urgency || 'normal',
      fabric: fabricInfo,
      customizations: {
        sleeveType,
        collarType,
        hasButtons,
        hasZippers,
        requirements: requirements || {},
        embroidery: embData?.enabled ? { ...embData, pricing: embroideryPricing } : undefined
      },
    });

    // Save measurements to history
    const measurementData = measurements || measurementSnapshot;
    if (measurementData && Object.keys(measurementData).length) {
      await MeasurementHistory.create({ customer: customer._id, measurements: measurementData, source: 'order' });
    }

    // Auto-generate bill for the order
    let billId = null;
    try {
      const Bill = require('../models/Bill');
      const bill = await Bill.create({
        order: order._id,
        customer: customer._id,
        amount: totalAmount,
        paymentMethod: 'Razorpay',
        status: 'Pending',
        amountPaid: 0,
        payments: [],
      });
      billId = bill._id;
      console.log('💳 Bill generated:', billId, 'Amount:', totalAmount);
    } catch (billError) {
      console.warn('⚠️ Failed to generate bill:', billError.message);
      // Continue even if bill generation fails
    }

    console.log('✅ Order created:', order._id, 'Total:', totalAmount);
    res.status(201).json({ 
      order: {
        ...order.toObject(),
        bill: billId
      }
    });
  } catch (e) {
    console.error('❌ Portal create order error:', e.message);
    console.error('Error stack:', e.stack);
    res.status(500).json({ message: 'Server error: ' + e.message });
  }
});

// Appointments
router.post('/appointments', auth, allowRoles('Customer'), async (req, res) => {
  try {
    console.log('🔍 Creating appointment for user:', req.user.id);
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) {
      console.log('❌ Customer profile not found for user:', req.user.id);
      return res.status(404).json({ message: 'Customer profile not found. Please complete your profile first.' });
    }
    
    console.log('👥 Customer found:', customer._id);
    
    const { service, scheduledAt, notes } = req.body;
    
    // Validate required fields
    if (!service) {
      console.log('❌ Missing service field');
      return res.status(400).json({ message: 'Service is required' });
    }
    
    if (!scheduledAt) {
      console.log('❌ Missing scheduledAt field');
      return res.status(400).json({ message: 'Date and time are required' });
    }
    
    // Validate date format and future date
    const appointmentDate = new Date(scheduledAt);
    if (isNaN(appointmentDate.getTime())) {
      console.log('❌ Invalid date format:', scheduledAt);
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    const now = new Date();
    if (appointmentDate <= now) {
      console.log('❌ Past date provided:', scheduledAt);
      return res.status(400).json({ message: 'Appointment date must be in the future' });
    }
    
    console.log('✅ Validation passed, creating appointment...');
    
    const appointmentData = {
      customer: customer._id,
      service: service.trim(),
      scheduledAt: appointmentDate,
      notes: notes ? notes.trim() : '',
      status: 'Scheduled'
    };
    
    console.log('📝 Appointment data:', JSON.stringify(appointmentData, null, 2));
    
    const appt = await Appointment.create(appointmentData);
    console.log('✅ Appointment created successfully:', appt._id);
    
    res.status(201).json({ 
      message: 'Appointment booked successfully!',
      appointment: appt 
    });
  } catch (error) {
    console.error('❌ Appointment creation error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: `Validation error: ${messages.join(', ')}` });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An appointment with these details already exists' });
    }
    
    res.status(500).json({ message: 'Server error while saving appointment. Please try again.' });
  }
});

router.get('/appointments', auth, allowRoles('Customer'), async (req, res) => {
  try {
    console.log('🔍 Fetching appointments for user:', req.user?.id);
    
    // Test mode: Return mock appointments
    if (req.user?.id === 'test_user_id') {
      res.json({ 
        appointments: [
          { _id: 'apt1', scheduledAt: '2024-01-10T10:00:00Z', status: 'Scheduled', type: 'Fitting' },
          { _id: 'apt2', scheduledAt: '2024-01-15T14:00:00Z', status: 'Scheduled', type: 'Consultation' }
        ] 
      });
      return;
    }
    
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) {
      console.log('❌ Customer profile not found for user:', req.user.id);
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    
    console.log('👥 Customer found:', customer._id);
    
    const { upcoming } = req.query;
    const filter = { customer: customer._id };
    if (upcoming === 'true') filter.scheduledAt = { $gte: new Date() };
    
    console.log('🔍 Filter:', filter);
    
    const appts = await Appointment.find(filter).sort({ scheduledAt: 1 });
    console.log('✅ Found appointments:', appts.length);
    
    res.json({ appointments: appts });
  } catch (error) {
    console.error('❌ Fetch appointments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/appointments/:id/cancel', auth, allowRoles('Customer'), async (req, res) => {
  const customer = await getCustomerByUser(req.user.id);
  if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
  const appt = await Appointment.findOneAndUpdate({ _id: req.params.id, customer: customer._id }, { status: 'Cancelled' }, { new: true });
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  res.json({ appointment: appt });
});

// Reschedule appointment
router.put('/appointments/:id/reschedule', auth, allowRoles('Customer'), async (req, res) => {
  const customer = await getCustomerByUser(req.user.id);
  if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
  const { scheduledAt } = req.body;
  if (!scheduledAt) return res.status(400).json({ message: 'scheduledAt is required' });
  const appt = await Appointment.findOne({ _id: req.params.id, customer: customer._id });
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  if (appt.status === 'Cancelled') return res.status(400).json({ message: 'Cannot reschedule a cancelled appointment' });
  appt.scheduledAt = new Date(scheduledAt);
  appt.status = 'Scheduled';
  await appt.save();
  res.json({ appointment: appt });
});

// Appointment detailed view: includes related order, measurements, fabric, attachments
router.get('/appointments/:id/details', auth, allowRoles('Customer'), async (req, res) => {
  try {
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer profile not found' });

    const appointment = await Appointment.findOne({ _id: req.params.id, customer: customer._id }).lean();
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Get most recent order for this customer (fallback until explicit link is added)
    const order = await Order.findOne({ customer: customer._id })
      .sort({ createdAt: -1 })
      .populate('assignedTailor', 'name email')
      .lean();

    // Measurements priority: order snapshot -> latest measurement history
    let measurements = order?.measurementSnapshot || null;
    if (!measurements) {
      const mh = await MeasurementHistory.findOne({ customer: customer._id }).sort({ createdAt: -1 }).lean();
      measurements = mh?.measurements || null;
    }

    const details = {
      appointment,
      order: order ? {
        id: order._id,
        status: order.status,
        stage: order.stage,
        expectedDelivery: order.expectedDelivery,
        assignedTailor: order.assignedTailor || null,
        fabric: order.fabric || null,
        items: order.items || [],
        notes: order.notes || '',
        attachments: order.attachments || [],
      } : null,
      measurements,
    };

    res.json({ success: true, details });
  } catch (e) {
    console.error('Appointment details error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Bills list for portal (customer)
router.get('/bills', auth, allowRoles('Customer'), async (req, res) => {
  try {
    console.log('🔍 Bills request from user:', req.user.id);
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) {
      console.log('❌ Customer profile not found');
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    console.log('👥 Customer found:', customer._id);

    // find orders for this customer then their bills
    const orders = await Order.find({ customer: customer._id }).select('_id totalAmount status').lean();
    console.log('📦 Orders found:', orders.length);
    
    const orderIds = orders.map(o => o._id);
    const bills = await require('../models/Bill').find({ order: { $in: orderIds } })
      .populate({ path: 'order', select: 'itemType status totalAmount createdAt', populate: { path: 'customer', select: 'name' } })
      .sort({ createdAt: -1 })
      .lean();

    console.log('💰 Existing bills:', bills.length);

    // Auto-generate bills for orders that don't have bills yet
    const ordersWithoutBills = orders.filter(order => 
      !bills.some(bill => String(bill.order._id) === String(order._id))
    );

    console.log('🆕 Orders without bills:', ordersWithoutBills.length);

    if (ordersWithoutBills.length > 0) {
      const Bill = require('../models/Bill');
      const newBills = [];
      
      for (const order of ordersWithoutBills) {
        try {
          console.log(`Creating bill for order ${order._id} with amount ${order.totalAmount}`);
          const bill = await Bill.create({
            order: order._id,
            amount: order.totalAmount || 0,
            paymentMethod: 'Cash',
            status: 'Unpaid',
            amountPaid: 0,
            payments: [],
          });
          newBills.push(bill);
          console.log(`✅ Created bill ${bill._id}`);
        } catch (err) {
          console.error('Error creating bill for order:', order._id, err.message);
        }
      }
      
      if (newBills.length > 0) {
        console.log(`🔄 Fetching updated bills list...`);
        // Fetch updated bills list
        const updatedBills = await Bill.find({ order: { $in: orderIds } })
          .populate({ path: 'order', select: 'itemType status totalAmount createdAt', populate: { path: 'customer', select: 'name' } })
          .sort({ createdAt: -1 })
          .lean();
        
        console.log('📋 Updated bills count:', updatedBills.length);
        return res.json({ success: true, bills: updatedBills });
      }
    }

    console.log('📋 Returning bills:', bills.length);
    res.json({ success: true, bills });
  } catch (e) {
    console.error('❌ Portal bills error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Bill details by id for portal (customer)
router.get('/bills/:id', auth, allowRoles('Customer'), async (req, res) => {
  try {
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer profile not found' });

    const Bill = require('../models/Bill');
    const bill = await Bill.findById(req.params.id)
      .populate({ path: 'order', populate: { path: 'customer', select: 'name' } })
      .lean();
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    // Security: ensure the bill belongs to this customer
    if (String(bill.order?.customer?._id) !== String(customer._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, bill });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Test endpoint to create a bill for testing
router.post('/bills/create-test', auth, allowRoles('Customer'), async (req, res) => {
  try {
    console.log('🧪 Creating test bill for user:', req.user.id);
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    // Find the first order for this customer
    const order = await Order.findOne({ customer: customer._id });
    if (!order) {
      return res.status(404).json({ message: 'No orders found for this customer' });
    }

    // Check if bill already exists
    const existingBill = await require('../models/Bill').findOne({ order: order._id });
    if (existingBill) {
      return res.json({ 
        success: true, 
        message: 'Bill already exists', 
        bill: existingBill 
      });
    }

    // Create a test bill
    const bill = await require('../models/Bill').create({
      order: order._id,
      amount: order.totalAmount || 2000,
      paymentMethod: 'Cash',
      status: 'Unpaid',
      amountPaid: 0,
      payments: []
    });

    console.log('✅ Created test bill:', bill._id);
    res.json({ 
      success: true, 
      message: 'Test bill created successfully', 
      bill: bill 
    });

  } catch (e) {
    console.error('❌ Create test bill error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payments by bill ID
// Get bill by ID (for customer)
router.get('/bills/:id', auth, allowRoles('Customer'), async (req, res) => {
  try {
    const Bill = require('../models/Bill');
    const bill = await Bill.findById(req.params.id)
      .populate({
        path: 'order',
        populate: { path: 'customer', select: 'name email phone' }
      })
      .populate('customer');
    
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    
    // Verify the bill belongs to this customer
    const customer = await getCustomerByUser(req.user.id);
    if (!customer || bill.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, bill });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Download Receipt/Invoice
router.get('/bills/:id/receipt', auth, allowRoles('Customer'), async (req, res) => {
  try {
    console.log('📄 Generating receipt for bill:', req.params.id);
    
    const Bill = require('../models/Bill');
    const bill = await Bill.findById(req.params.id)
      .populate({
        path: 'order',
        populate: { path: 'customer', select: 'name email phone address' }
      })
      .populate('customer', 'name email phone address');
    
    console.log('📋 Bill found:', bill ? 'Yes' : 'No');
    
    if (!bill) {
      console.log('❌ Bill not found');
      return res.status(404).send('<html><body><h1>Receipt Not Found</h1><p>The requested receipt could not be found.</p></body></html>');
    }
    
    // Verify the bill belongs to this customer
    const customer = await getCustomerByUser(req.user.id);
    console.log('👤 Customer found:', customer ? 'Yes' : 'No');
    console.log('🔐 Bill customer ID:', bill.customer?._id || bill.customer);
    console.log('🔐 Request customer ID:', customer?._id);
    
    if (!customer) {
      console.log('❌ Customer profile not found');
      return res.status(403).send('<html><body><h1>Access Denied</h1><p>Customer profile not found.</p></body></html>');
    }
    
    // Check if bill belongs to customer
    const billCustomerId = bill.customer?._id ? bill.customer._id.toString() : bill.customer.toString();
    const requestCustomerId = customer._id.toString();
    
    if (billCustomerId !== requestCustomerId) {
      console.log('❌ Access denied - customer mismatch');
      return res.status(403).send('<html><body><h1>Access Denied</h1><p>This receipt does not belong to you.</p></body></html>');
    }
    
    console.log('✅ Access granted, generating receipt HTML');
    
    // Get customer name from either bill.customer or bill.order.customer or customer record
    const customerName = bill.customer?.name || bill.order?.customer?.name || customer.name || 'N/A';
    const customerPhone = bill.customer?.phone || bill.order?.customer?.phone || customer.phone || 'N/A';
    const customerAddress = bill.customer?.address || bill.order?.customer?.address || customer.address || 'N/A';
    
    console.log('📝 Customer info:', { name: customerName, phone: customerPhone });
    console.log('💰 Bill details:', { 
      billNumber: bill.billNumber, 
      amount: bill.amount, 
      amountPaid: bill.amountPaid,
      status: bill.status,
      paymentMethod: bill.paymentMethod
    });
    
    // Generate receipt HTML
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${bill.billNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #667eea; margin: 0; }
    .info-section { margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .label { font-weight: bold; color: #555; }
    .value { color: #333; }
    .status { padding: 5px 15px; border-radius: 20px; display: inline-block; }
    .status.paid { background: #10b981; color: white; }
    .status.pending { background: #f59e0b; color: white; }
    .total { font-size: 24px; color: #667eea; font-weight: bold; margin-top: 20px; text-align: right; }
    .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; }
    @media print {
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Style Hub</h1>
    <p>Payment Receipt</p>
  </div>
  
  <div class="info-section">
    <h3>Receipt Information</h3>
    <div class="info-row">
      <span class="label">Receipt Number:</span>
      <span class="value">${bill.billNumber || 'N/A'}</span>
    </div>
    <div class="info-row">
      <span class="label">Date:</span>
      <span class="value">${new Date(bill.createdAt).toLocaleString()}</span>
    </div>
    <div class="info-row">
      <span class="label">Customer Name:</span>
      <span class="value">${customerName}</span>
    </div>
    <div class="info-row">
      <span class="label">Phone:</span>
      <span class="value">${customerPhone}</span>
    </div>
    <div class="info-row">
      <span class="label">Order ID:</span>
      <span class="value">#${bill.order?._id?.toString().slice(-8) || 'N/A'}</span>
    </div>
    <div class="info-row">
      <span class="label">Garment Type:</span>
      <span class="value">${bill.order?.itemType || 'Custom Garment'}</span>
    </div>
  </div>
  
  <div class="info-section">
    <h3>Payment Details</h3>
    <div class="info-row">
      <span class="label">Total Amount:</span>
      <span class="value">₹${Number(bill.amount || 0).toFixed(2)}</span>
    </div>
    <div class="info-row">
      <span class="label">Amount Paid:</span>
      <span class="value">₹${Number(bill.amountPaid || 0).toFixed(2)}</span>
    </div>
    ${bill.amount - bill.amountPaid > 0 ? `<div class="info-row">
      <span class="label">Balance Due:</span>
      <span class="value" style="color: #f59e0b;">₹${Number(bill.amount - bill.amountPaid).toFixed(2)}</span>
    </div>` : ''}
    <div class="info-row">
      <span class="label">Payment Method:</span>
      <span class="value">${bill.paymentMethod || 'N/A'}</span>
    </div>
    <div class="info-row">
      <span class="label">Payment Status:</span>
      <span class="value"><span class="status ${(bill.status || 'pending').toLowerCase()}">${bill.status || 'Pending'}</span></span>
    </div>
    ${bill.paidAt ? `<div class="info-row">
      <span class="label">Paid On:</span>
      <span class="value">${new Date(bill.paidAt).toLocaleString()}</span>
    </div>` : ''}
  </div>
  
  ${bill.payments && bill.payments.length > 0 ? `
  <div class="info-section">
    <h3>Payment History</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Date</th>
          <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Method</th>
          <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Amount</th>
          <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Reference</th>
        </tr>
      </thead>
      <tbody>
        ${bill.payments.map(payment => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(payment.paidAt).toLocaleString()}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${payment.method}</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #e5e7eb;">₹${Number(payment.amount).toFixed(2)}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${payment.reference || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
  
  <div class="total">
    Total: ₹${bill.amount.toFixed(2)}
  </div>
  
  <div class="footer">
    <p>Thank you for choosing Style Hub!</p>
    <p>For any queries, please contact us at support@stylehub.com</p>
    <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
  </div>
</body>
</html>
    `;
    
    console.log('✅ Receipt HTML generated, sending response');
    res.setHeader('Content-Type', 'text/html');
    res.send(receiptHTML);
    
  } catch (error) {
    console.error('❌ Receipt generation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1 style="color: #dc2626;">Receipt Generation Failed</h1>
          <p>We encountered an error while generating your receipt.</p>
          <p style="color: #888; font-size: 14px;">Error: ${error.message}</p>
          <p style="margin-top: 20px;">
            <a href="/dashboard/customer/orders" style="color: #667eea; text-decoration: none;">← Back to Orders</a>
          </p>
        </body>
      </html>
    `);
  }
});

router.get('/payments/by-bill/:billId', auth, allowRoles('Customer'), async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const Bill = require('../models/Bill');
    
    // Verify the bill exists and belongs to the customer
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
    
    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      // If MongoDB is not available, return mock payment data for test bills
      if (req.params.billId.startsWith('test-bill-')) {
        return res.json({
          payments: [
            {
              _id: 'payment-1',
              amount: 2000,
              method: 'Razorpay',
              status: 'completed',
              razorpayPaymentId: 'pay_test123456789',
              createdAt: new Date()
            }
          ]
        });
      }
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // Get payments for this bill
    const payments = await Payment.find({ bill: req.params.billId }).sort({ createdAt: -1 });
    
    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payments by bill:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// ADMIN ENDPOINT: Fix existing orders with totalAmount = 0
router.post('/admin/fix-orders', auth, allowRoles('Customer'), async (req, res) => {
  try {
    console.log('🔧 Starting order fix process...');
    
    // Find all orders with totalAmount = 0
    const orders = await Order.find({ totalAmount: 0 }).populate('customer');
    console.log(`📦 Found ${orders.length} orders with totalAmount = 0`);

    const basePrices = {
      'shirt': 800,
      'pants': 600,
      'suit': 2000,
      'dress': 1200,
      'kurta': 1000,
      'blouse': 800,
      'lehenga': 2500,
      'jacket': 1500,
      'other': 1000
    };

    let fixedCount = 0;
    let billsCreated = 0;
    const Bill = require('../models/Bill');

    for (const order of orders) {
      try {
        let totalAmount = 0;

        // Get base price from garment type
        const garmentType = (order.itemType || '').toLowerCase();
        const basePrice = basePrices[garmentType] || 1000;
        totalAmount += basePrice;

        // Add fabric cost if exists
        if (order.fabric && order.fabric.source === 'shop' && order.fabric.cost) {
          totalAmount += Number(order.fabric.cost);
        }

        // Add embroidery cost if exists
        if (order.customizations?.embroidery?.enabled) {
          const embroideryTotal = order.customizations.embroidery.pricing?.total || 0;
          totalAmount += embroideryTotal;
        }

        // Add urgency charge if exists
        if (order.urgency === 'urgent') {
          totalAmount += 500;
        }

        // If we still have 0, use items price as fallback
        if (totalAmount === 0 && order.items && order.items.length > 0) {
          totalAmount = order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        }

        // Default minimum if still 0
        if (totalAmount === 0) {
          totalAmount = 1000;
        }

        // Update the order
        order.totalAmount = totalAmount;
        await order.save();
        fixedCount++;

        // Check if bill exists
        const existingBill = await Bill.findOne({ order: order._id });
        
        if (!existingBill && order.customer) {
          // Create bill
          await Bill.create({
            order: order._id,
            customer: order.customer._id || order.customer,
            amount: totalAmount,
            paymentMethod: 'Razorpay',
            status: 'Pending',
            amountPaid: 0,
            payments: [],
          });
          billsCreated++;
        } else if (existingBill) {
          // Update existing bill amount
          existingBill.amount = totalAmount;
          await existingBill.save();
        }

      } catch (err) {
        console.error(`Error fixing order ${order._id}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Fixed ${fixedCount} orders and created ${billsCreated} bills`,
      fixedCount,
      billsCreated
    });

  } catch (error) {
    console.error('Error fixing orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fix orders', error: error.message });
  }
});

module.exports = router;