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

// Dashboard
router.get('/dashboard', auth, allowRoles('Customer'), async (req, res) => {
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
  const unfinished = await Order.countDocuments({ customer: customer._id, status: { $in: ['Pending', 'In Progress'] } });
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
});

// Profile
router.get('/profile', auth, allowRoles('Customer'), async (req, res) => {
  try {
    console.log('🔍 Profile request received for user:', req.user.id);
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

// Bills for the logged-in customer
router.get('/bills', auth, allowRoles('Customer'), async (req, res) => {
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
});

// Measurements (customers can view and update)
router.get('/measurements', auth, allowRoles('Customer'), async (req, res) => {
  const customer = await getCustomerByUser(req.user.id);
  if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
  const history = await MeasurementHistory.find({ customer: customer._id }).sort({ createdAt: -1 });
  res.json({ current: customer.measurements, styleNotes: customer.styleNotes || '', history });
});

router.put('/measurements', auth, allowRoles('Customer'), async (req, res) => {
  try {
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
    const { measurements = {}, styleNotes = '' } = req.body;
    customer.measurements = measurements;
    customer.styleNotes = styleNotes;
    await customer.save();
    await MeasurementHistory.create({ customer: customer._id, measurements, styleNotes, source: 'portal' });
    res.json({ success: true, current: customer.measurements });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Orders
router.get('/orders', auth, allowRoles('Customer'), async (req, res) => {
  const customer = await getCustomerByUser(req.user.id);
  if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
  const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

// Bill for a specific order (Customer)
router.get('/bills/by-order/:orderId', auth, allowRoles('Customer'), async (req, res) => {
  const customer = await getCustomerByUser(req.user.id);
  if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
  const order = await Order.findOne({ _id: req.params.orderId, customer: customer._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const bill = await require('../models/Bill').findOne({ order: order._id });
  if (!bill) return res.status(404).json({ message: 'Bill not found' });
  res.json({ bill: {
    _id: bill._id,
    order: bill.order,
    amount: bill.amount,
    amountPaid: bill.amountPaid,
    status: bill.status,
  }});
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

// Customer cancel order (allowed only if status Pending or In Progress)
router.put('/orders/:id/cancel', auth, allowRoles('Customer'), async (req, res) => {
  const customer = await getCustomerByUser(req.user.id);
  if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
  const order = await Order.findOne({ _id: req.params.id, customer: customer._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!['Pending', 'In Progress'].includes(order.status)) {
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

    const { items = [], measurementSnapshot = {}, notes, expectedDelivery, fabric, customizations } = req.body;

    // Handle fabric selection and stock decrement when shop fabric is used
    let fabricInfo = { source: 'none' };
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
      const cost = unitPrice * qty;
      fabricInfo = {
        source: 'shop',
        fabricId: fb._id,
        name: fb.name,
        code: '',
        color: fb.color || '',
        quantity: qty,
        unit: 'm',
        unitPrice,
        cost,
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

    // Customer portal: do not compute or append charges for embroidery here.
    // Admin will add all charges later from dashboard.
    let embroideryPricing = undefined;

    const totalAmount = items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

    const order = await Order.create({
      customer: customer._id,
      items,
      status: 'Pending',
      totalAmount,
      measurementSnapshot,
      notes,
      expectedDelivery: expectedDelivery || null,
      fabric: fabricInfo,
      customizations: customizations?.embroidery ? { embroidery: { ...customizations.embroidery, pricing: embroideryPricing } } : undefined,
    });

    if (measurementSnapshot && Object.keys(measurementSnapshot).length) {
      await MeasurementHistory.create({ customer: customer._id, measurements: measurementSnapshot, source: 'order' });
    }

    res.status(201).json({ order });
  } catch (e) {
    console.error('Portal create order error:', e.message);
    res.status(500).json({ message: 'Server error' });
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
    console.log('🔍 Fetching appointments for user:', req.user.id);
    
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
    const customer = await getCustomerByUser(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer profile not found' });

    // find orders for this customer then their bills
    const orders = await Order.find({ customer: customer._id }).select('_id').lean();
    const orderIds = orders.map(o => o._id);
    const bills = await require('../models/Bill').find({ order: { $in: orderIds } })
      .populate({ path: 'order', select: 'itemType status totalAmount createdAt', populate: { path: 'customer', select: 'name' } })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, bills });
  } catch (e) {
    console.error('Portal bills error:', e.message);
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

module.exports = router;