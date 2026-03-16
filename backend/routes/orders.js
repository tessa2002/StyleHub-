const express = require('express');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const MeasurementHistory = require('../models/MeasurementHistory');
const Fabric = require('../models/Fabric');
const { auth, allowRoles } = require('../middleware/auth');

const router = express.Router();

// Create a new order (Admin/Staff)
router.post('/', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { customerId, items = [], measurementSnapshot = {}, notes, orderType, itemType, assignedTailor, fabric, orderDate, expectedDelivery, customizations } = req.body;
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Handle fabric stock if shop fabric is selected
    let fabricInfo = fabric || {};
    if (fabric && fabric.source === 'shop' && fabric.fabricId) {
      const qty = Math.max(0, Number(fabric.quantity || 0));
      if (!qty) return res.status(400).json({ success: false, message: 'Fabric quantity must be > 0' });
      const fb = await Fabric.findOneAndUpdate(
        { _id: fabric.fabricId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );
      if (!fb) return res.status(400).json({ success: false, message: 'Insufficient fabric stock' });
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
    }

    // Embroidery pricing (simple rules)
    let embroideryPricing = { unitPrice: 0, quantity: 1, total: 0 };
    if (customizations?.embroidery?.enabled) {
      const emb = customizations.embroidery;
      const base = { machine: 300, hand: 800, zardosi: 1200, aari: 1000, bead: 900, thread: 500 };
      const perPlacement = { collar: 150, sleeves: 200, neckline: 250, hem: 300, full: 1200, custom: 300 };
      const perExtraColor = 50;
      const t = base[emb.type] || 0;
      const p = (emb.placements || []).reduce((sum, pl) => sum + (perPlacement[pl] || 0), 0);
      const extraColors = Math.max(0, (emb.colors?.length || 0) - 1);
      const total = t + p + (extraColors * perExtraColor);
      embroideryPricing = { unitPrice: total, quantity: 1, total };
      // Add charge item for embroidery
      items.push({ name: `Embroidery (${emb.type}, ${(emb.placements||[]).join('/') || 'n/a'}, ${emb.pattern})`, quantity: 1, price: total });
    }

    const totalAmount = items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

    // Derive itemType from items if not provided
    let derivedItemType = itemType || orderType || '';
    if (!derivedItemType && items.length > 0) {
      derivedItemType = items[0].name || 'Custom Garment';
    }

    const order = await Order.create({
      customer: customerId,
      items,
      status: 'Pending',
      totalAmount,
      measurementSnapshot,
      notes,
      orderType: orderType || '',
      itemType: derivedItemType,
      assignedTailor: assignedTailor || null,
      fabric: fabricInfo,
      customizations: customizations?.embroidery ? { embroidery: { ...customizations.embroidery, pricing: embroideryPricing } } : undefined,
      orderDate: orderDate || Date.now(),
      expectedDelivery: expectedDelivery || null,
    });

    // Save measurement history snapshot if provided (source: order)
    if (measurementSnapshot && Object.keys(measurementSnapshot).length) {
      await MeasurementHistory.create({ customer: customerId, measurements: measurementSnapshot, source: 'order' });
    }

    res.status(201).json({ success: true, order });
  } catch (e) {
    console.error('Create order error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// List orders (Admin/Staff/Tailor) with filters
router.get('/', auth, allowRoles('Admin', 'Staff', 'Tailor'), async (req, res) => {
  try {
    const { status, customerId, staffId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (customerId) filter.customer = customerId;
    if (staffId) filter.assignedTailor = staffId;

    let orders = await Order.find(filter)
      .populate('customer', 'name phone email')
      .populate('assignedTailor', 'name')
      .sort({ createdAt: -1 })
      .lean();
    
    // Derive itemType for orders that don't have it
    orders = orders.map(order => {
      if (!order.itemType && order.items && order.items.length > 0) {
        order.itemType = order.items[0].name || 'Custom Garment';
      }
      if (!order.itemType && order.orderType) {
        order.itemType = order.orderType;
      }
      if (!order.itemType) {
        order.itemType = 'Custom Garment';
      }
      // Ensure customer name is available
      if (order.customer && order.customer.name) {
        order.customerName = order.customer.name;
      }
      return order;
    });
    
    console.log(`📦 Admin fetched ${orders.length} orders`);
    res.json({ success: true, orders });
  } catch (e) {
    console.error('❌ Error fetching orders:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get orders assigned to current user (Staff/Tailor) - MUST BE BEFORE /:id route!
// @access  Private
router.get('/assigned', auth, allowRoles('Staff', 'Tailor'), async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('🔍 ===== FETCHING ASSIGNED ORDERS =====');
    console.log('User Details:', { userId, userName: req.user.name, userRole, userIdType: typeof userId });
    
    // Build query - Convert userId to ObjectId for proper comparison
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let query = { assignedTailor: userObjectId };
    
    console.log('🔎 Query:', { assignedTailor: userObjectId.toString(), queryType: typeof userObjectId });
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { itemType: { $regex: search, $options: 'i' } }
      ];
    }
    
    let orders = await Order.find(query)
      .populate('assignedTailor', 'name')
      .populate('customer', 'name phone') // Populate basic customer info for tailors
      .sort({ expectedDelivery: 1, createdAt: -1 })
      .lean();
    
    console.log(`✅ Found ${orders.length} orders for ${userRole} ${req.user.name}`);
    if (orders.length > 0) {
      console.log('📋 Sample order:', {
        id: orders[0]._id,
        itemType: orders[0].itemType,
        status: orders[0].status,
        assignedTailor: orders[0].assignedTailor,
        attachments: orders[0].attachments?.length || 0
      });
      if (orders[0].attachments && orders[0].attachments.length > 0) {
        console.log('📸 Has reference images:', orders[0].attachments.map(a => a.filename));
      }
    }
    
    // Process orders based on role
    orders = orders.map(order => {
      // Derive itemType
      if (!order.itemType && order.items && order.items.length > 0) {
        order.itemType = order.items[0].name || 'Custom Garment';
      }
      if (!order.itemType && order.orderType) {
        order.itemType = order.orderType;
      }
      if (!order.itemType) {
        order.itemType = 'Custom Garment';
      }
      
      // For Tailors: Remove sensitive customer & pricing data
      if (userRole === 'Tailor') {
        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          itemType: order.itemType,
          items: order.items,
          measurements: order.measurements || order.measurementSnapshot, // ✅ FIX: Check both field names
          measurementSnapshot: order.measurementSnapshot, // Add explicit field
          fabric: order.fabric, // ✅ ADD: Fabric details
          customizations: order.customizations, // ✅ ADD: Design customizations
          designNotes: order.designNotes || order.notes,
          specialInstructions: order.specialInstructions || order.notes,
          notes: order.notes, // Add notes field
          status: order.status,
          priority: order.priority,
          expectedDelivery: order.expectedDelivery,
          deliveryDate: order.deliveryDate,
          assignedTailor: order.assignedTailor,
          workStartedAt: order.workStartedAt,
          completedAt: order.completedAt,
          createdAt: order.createdAt,
          attachments: order.attachments || [], // ✅ ADD: Reference images from customer
          customer: order.customer ? {
            name: order.customer.name,
            phone: order.customer.phone
          } : null, // Basic customer info needed for order details
          // NO pricing, NO payment info
        };
      }
      
      // For Staff: Full access
      return order;
    });
    
    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching assigned orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get order by id
router.get('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Tailor-specific orders
router.get('/tailor/:tailorId', auth, allowRoles('Admin', 'Staff', 'Tailor'), async (req, res) => {
  try {
    const { tailorId } = req.params;
    console.log(`📋 Fetching orders for tailor: ${tailorId}`);
    const orders = await Order.find({ assignedTailor: tailorId })
      .populate('customer', 'name phone email')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Found ${orders.length} orders for tailor ${tailorId}`);
    res.json(orders);
  } catch (e) {
    console.error('❌ Error fetching tailor orders:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Order history for a customer
router.get('/by-customer/:customerId', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customer: customerId })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update order status or details
router.put('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const update = req.body;
    
    console.log('📝 Updating order:', {
      orderId: req.params.id,
      updateFields: Object.keys(update),
      assignedTailor: update.assignedTailor
    });
    
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('customer', 'name phone')
      .populate('assignedTailor', 'name email role');
      
    if (!order) {
      console.log('❌ Order not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    console.log('✅ Order updated:', {
      orderId: order._id,
      assignedTailor: order.assignedTailor ? {
        id: order.assignedTailor._id,
        name: order.assignedTailor.name
      } : 'Not assigned'
    });
    
    res.json({ success: true, order });
  } catch (e) {
    console.error('❌ Error updating order:', e);
    res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
});

// Update status shorthand (REMOVED - using enhanced version below)

// Assign tailor
router.put('/:id/assign', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { tailorId } = req.body;
    
    console.log('👔 Assigning order:', {
      orderId: req.params.id,
      tailorId: tailorId,
      assignedBy: req.user.name
    });
    
    if (!tailorId) {
      return res.status(400).json({ success: false, message: 'Tailor ID is required' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { assignedTailor: tailorId }, 
      { new: true }
    )
    .populate('customer', 'name phone')
    .populate('assignedTailor', 'name email role');
    
    if (!order) {
      console.log('❌ Order not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    console.log('✅ Order assigned successfully:', {
      orderId: order._id,
      assignedTailor: order.assignedTailor?.name,
      tailorId: order.assignedTailor?._id
    });
    
    res.json({ success: true, order, message: 'Order assigned successfully' });
  } catch (e) {
    console.error('❌ Error assigning order:', e);
    res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
});

// Accept order (Tailor)
router.put('/:id/accept', auth, allowRoles('Tailor', 'Admin', 'Staff'), async (req, res) => {
  try {
    const { acceptedByTailor, acceptedAt } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { 
        acceptedByTailor: true,
        acceptedAt: acceptedAt || new Date(),
        status: 'Cutting' // Move to first stage
      }, 
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    console.log(`✅ Order ${req.params.id} accepted by tailor`);
    res.json({ success: true, order, message: 'Order accepted successfully' });
  } catch (e) {
    console.error('Error accepting order:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Request change (Tailor)
router.put('/:id/request-change', auth, allowRoles('Tailor', 'Admin', 'Staff'), async (req, res) => {
  try {
    const { changeRequest, requestedBy, requestedAt } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          changeRequests: {
            request: changeRequest,
            requestedBy: requestedBy || req.user.id,
            requestedAt: requestedAt || new Date(),
            status: 'pending'
          }
        }
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    console.log(`📝 Change request submitted for order ${req.params.id}`);
    res.json({ success: true, order, message: 'Change request submitted successfully' });
  } catch (e) {
    console.error('Error submitting change request:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start work on order (Tailor)
router.put('/:id/start-work', auth, allowRoles('Tailor', 'Admin', 'Staff'), async (req, res) => {
  try {
    const { startedAt, startedBy } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Cutting',
        workStartedAt: startedAt || new Date(),
        workStartedBy: startedBy || req.user.id
      },
      { new: true }
    ).populate('customer', 'name phone email');
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    console.log(`▶️ Work started on order ${req.params.id} by tailor ${req.user.name}`);
    
    // Send notifications to admins and customer
    try {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      
      const orderIdShort = String(order._id).slice(-6).toUpperCase();
      const tailorName = req.user.name || 'Tailor';
      const itemType = order.itemType || order.items?.[0]?.name || 'Order';
      
      // 1. Notify all admins
      const admins = await User.find({ role: 'Admin' });
      const adminNotifications = admins.map(admin => ({
        recipientId: admin._id,
        message: `🔨 ${tailorName} started working on Order #${orderIdShort} (${itemType})`,
        type: 'info',
        priority: 'medium',
        relatedOrder: order._id,
        createdBy: req.user.id,
        actionUrl: `/admin/orders/${order._id}`
      }));
      
      await Promise.all(adminNotifications.map(notif => 
        Notification.createNotification(notif)
      ));
      
      console.log(`✅ Sent notifications to ${admins.length} admin(s)`);
      
      // 2. Notify customer (if they have a User account)
      if (order.customer && order.customer.email) {
        const customerUser = await User.findOne({ email: order.customer.email });
        
        if (customerUser) {
          await Notification.createNotification({
            recipientId: customerUser._id,
            message: `✂️ Great news! Your order #${orderIdShort} (${itemType}) is now being worked on!`,
            type: 'success',
            priority: 'high',
            relatedOrder: order._id,
            createdBy: req.user.id,
            actionUrl: `/portal/orders/${order._id}`
          });
          
          console.log(`✅ Sent notification to customer: ${order.customer.name}`);
        } else {
          console.log(`ℹ️ Customer ${order.customer.email} doesn't have a user account for notifications`);
        }
      }
      
    } catch (notifError) {
      console.warn('⚠️ Notification error (non-critical):', notifError.message);
      // Continue anyway - notifications are nice to have but not critical
    }
    
    res.json({ success: true, order, message: 'Work started successfully. Notifications sent!' });
  } catch (e) {
    console.error('Error starting work:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Advance order to next stage (Tailor)
router.put('/:id/next-stage', auth, allowRoles('Tailor', 'Admin', 'Staff'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name phone email');
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    // Define status progression
    const statusFlow = {
      'Pending': 'Cutting',
      'Order Placed': 'Cutting',
      'Cutting': 'Stitching',
      'Stitching': 'Ready',
      'Trial': 'Ready'
    };
    
    const currentStatus = order.status;
    const nextStatus = statusFlow[currentStatus];
    
    if (!nextStatus) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot advance from ${currentStatus}` 
      });
    }
    
    order.status = nextStatus;
    
    // Track timestamps
    if (nextStatus === 'Cutting' && !order.workStartedAt) {
      order.workStartedAt = new Date();
      order.workStartedBy = req.user.id;
    }
    
    if (nextStatus === 'Ready' && !order.completedAt) {
      order.completedAt = new Date();
      order.completedBy = req.user.id;
    }
    
    await order.save();
    
    console.log(`📈 Order ${req.params.id} advanced: ${currentStatus} → ${nextStatus} by ${req.user.name}`);
    
    // Send notifications for important transitions
    if (nextStatus === 'Ready') {
      try {
        const Notification = require('../models/Notification');
        const User = require('../models/User');
        
        const orderIdShort = String(order._id).slice(-6).toUpperCase();
        const tailorName = req.user.name || 'Tailor';
        const itemType = order.itemType || order.items?.[0]?.name || 'Order';
        
        // Notify admins/staff
        const admins = await User.find({ role: { $in: ['Admin', 'Staff'] } });
        const adminNotifications = admins.map(admin => ({
          recipientId: admin._id,
          message: `✅ Order #${orderIdShort} (${itemType}) completed by ${tailorName} - Ready for delivery!`,
          type: 'success',
          priority: 'high',
          relatedOrder: order._id,
          createdBy: req.user.id,
          actionUrl: `/admin/orders/${order._id}`
        }));
        
        await Promise.all(adminNotifications.map(notif => 
          Notification.createNotification(notif)
        ));
        
        // Notify customer
        if (order.customer && order.customer.email) {
          const customerUser = await User.findOne({ email: order.customer.email });
          
          if (customerUser) {
            await Notification.createNotification({
              recipientId: customerUser._id,
              message: `🎉 Exciting news! Your ${itemType} (Order #${orderIdShort}) is ready for collection!`,
              type: 'success',
              priority: 'high',
              relatedOrder: order._id,
              createdBy: req.user.id,
              actionUrl: `/portal/orders/${order._id}`
            });
          }
        }
        
        console.log(`✅ Sent notifications for completed order`);
      } catch (notifError) {
        console.warn('⚠️ Notification error:', notifError.message);
      }
    }
    
    res.json({ 
      success: true, 
      order, 
      message: `Status updated: ${currentStatus} → ${nextStatus}`,
      previousStatus: currentStatus,
      currentStatus: nextStatus
    });
  } catch (e) {
    console.error('Error advancing order stage:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark order as ready (Tailor)
router.put('/:id/mark-ready', auth, allowRoles('Tailor', 'Admin', 'Staff'), async (req, res) => {
  try {
    const { completedAt, completedBy } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Ready',
        completedAt: completedAt || new Date(),
        completedBy: completedBy || req.user.id
      },
      { new: true }
    ).populate('customer', 'name phone email');
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    console.log(`✅ Order ${req.params.id} marked as ready by tailor ${req.user.name}`);
    
    // Send notifications to admins and customer
    try {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      
      const orderIdShort = String(order._id).slice(-6).toUpperCase();
      const tailorName = req.user.name || 'Tailor';
      const itemType = order.itemType || order.items?.[0]?.name || 'Order';
      
      // 1. Notify all admins/staff
      const admins = await User.find({ role: { $in: ['Admin', 'Staff'] } });
      const adminNotifications = admins.map(admin => ({
        recipientId: admin._id,
        message: `✅ Order #${orderIdShort} (${itemType}) completed by ${tailorName} - Ready for delivery!`,
        type: 'success',
        priority: 'high',
        relatedOrder: order._id,
        createdBy: req.user.id,
        actionUrl: `/admin/orders/${order._id}`
      }));
      
      await Promise.all(adminNotifications.map(notif => 
        Notification.createNotification(notif)
      ));
      
      console.log(`✅ Sent notifications to ${admins.length} admin(s)/staff`);
      
      // 2. Notify customer (high priority!)
      if (order.customer && order.customer.email) {
        const customerUser = await User.findOne({ email: order.customer.email });
        
        if (customerUser) {
          await Notification.createNotification({
            recipientId: customerUser._id,
            message: `🎉 Exciting news! Your ${itemType} (Order #${orderIdShort}) is ready for collection!`,
            type: 'success',
            priority: 'high',
            relatedOrder: order._id,
            createdBy: req.user.id,
            actionUrl: `/portal/orders/${order._id}`
          });
          
          console.log(`✅ Sent notification to customer: ${order.customer.name}`);
        } else {
          console.log(`ℹ️ Customer ${order.customer.email} doesn't have a user account for notifications`);
        }
      }
      
    } catch (notifError) {
      console.warn('⚠️ Notification error (non-critical):', notifError.message);
      // Continue anyway - notifications are nice to have but not critical
    }
    
    res.json({ success: true, order, message: 'Order marked as ready. Notifications sent!' });
  } catch (e) {
    console.error('Error marking order as ready:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Append note (simple string)
router.post('/:id/notes', auth, allowRoles('Admin', 'Staff', 'Tailor'), async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ success: false, message: 'Note required' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.notes = [ ...(Array.isArray(order.notes) ? order.notes : (order.notes ? [order.notes] : [])), note ];
    await order.save();
    res.json({ success: true, notes: order.notes });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update notes (for tailor dashboard)
router.put('/:id/notes', auth, allowRoles('Admin', 'Staff', 'Tailor'), async (req, res) => {
  try {
    const { notes } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { notes }, 
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark embroidery complete -> move to Finishing stage
router.put('/:id/embroidery/complete', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const emb = order.customizations?.embroidery;
    if (!emb || !emb.enabled) return res.status(400).json({ success: false, message: 'Embroidery not enabled for this order' });
    order.customizations.embroidery.status = 'complete';
    order.stage = 'Finishing';
    await order.save();
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete order
router.delete('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/orders/debug-assignments
// @desc    Debug order assignments (Admin only)
// @access  Private (Admin)
router.get('/debug-assignments', auth, allowRoles('Admin'), async (req, res) => {
  try {
    console.log('\n🔍 ===== DEBUG ASSIGNMENTS =====');
    
    // Get all orders
    const orders = await Order.find({})
      .populate('assignedTailor', 'name email role')
      .select('_id assignedTailor customer status')
      .limit(10);
    
    console.log(`📦 Total orders checked: ${orders.length}`);
    
    // Get all users with Tailor role
    const User = require('../models/User');
    const tailors = await User.find({ role: 'Tailor' }).select('_id name email role');
    
    console.log(`👔 Tailors in system: ${tailors.length}`);
    tailors.forEach(t => {
      console.log(`  - ${t.name} (ID: ${t._id})`);
    });
    
    const debug = orders.map(o => {
      const result = {
        orderId: o._id.toString(),
        assignedTailor: o.assignedTailor ? {
          id: o.assignedTailor._id.toString(),
          name: o.assignedTailor.name,
          role: o.assignedTailor.role,
          idType: typeof o.assignedTailor._id
        } : 'NOT ASSIGNED',
        status: o.status
      };
      
      console.log(`\n📋 Order ${result.orderId.slice(-6)}:`);
      console.log(`   Assigned to: ${result.assignedTailor === 'NOT ASSIGNED' ? 'NOBODY' : result.assignedTailor.name}`);
      console.log(`   Tailor ID: ${result.assignedTailor === 'NOT ASSIGNED' ? 'N/A' : result.assignedTailor.id}`);
      console.log(`   Status: ${result.status}`);
      
      return result;
    });
    
    console.log('\n✅ Debug complete\n');
    
    res.json({ 
      success: true, 
      debug,
      tailors: tailors.map(t => ({
        id: t._id.toString(),
        name: t.name,
        email: t.email
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin/Staff/Tailor)
// @access  Private
router.put('/:id/status', auth, allowRoles('Admin', 'Staff', 'Tailor'), async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    
    console.log(`📝 Status update request: Order ${orderId}, New Status: ${status}`);
    
    // Find order and populate customer
    const order = await Order.findById(orderId).populate('customer');
    if (!order) {
      console.log('❌ Order not found');
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const oldStatus = order.status;
    console.log(`📊 Old Status: ${oldStatus} → New Status: ${status}`);
    
    // Update order status
    order.status = status;
    order.statusUpdatedAt = new Date();
    order.statusUpdatedBy = req.user.id;
    
    await order.save();
    console.log('✅ Order status saved to database');
    
    // Send completion email to customer (non-blocking)
    if (status === 'Completed' && order.customer?.email) {
      try {
        const nodemailer = require('nodemailer');
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = Number((process.env.SMTP_PORT || '587').toString().trim());
        const smtpUser = (process.env.SMTP_USER || '').toString().trim();
        const smtpPass = (process.env.SMTP_PASS || '').toString().replace(/\s/g, '').trim();
        const fromName = (process.env.MAIL_FROM || 'StyleHub').toString().replace(/<.*?>/, '').trim();
        const mailFrom = `"${fromName}" <${smtpUser || 'no-reply@stylehub.local'}>`;
        const portalUrl = process.env.PORTAL_URL || 'http://localhost:3000';
        
        if (smtpUser && smtpPass) {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass }
          });
        
          const orderIdShort = String(order._id).slice(-6).toUpperCase();
          const itemType = order.itemType || order.items?.[0]?.name || 'Order';
          const customerName = order.customer?.name || 'Customer';
        
          await transporter.sendMail({
            from: mailFrom,
            to: order.customer.email,
            subject: `Your StyleHub order #${orderIdShort} is finished`,
            html: `
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111">
                <p>Hi ${customerName},</p>
                <p>Your ${itemType} (Order #${orderIdShort}) has been marked as <strong>Finished</strong>.</p>
                <p>You can review details and arrange pickup or delivery from your portal:</p>
                <p><a href="${portalUrl}/portal/orders" style="background:#ee3a6a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open Customer Portal</a></p>
                <p style="color:#666">If you did not expect this message, please contact the boutique.</p>
                <p>— StyleHub</p>
              </div>
            `
          });
          console.log('📧 Completion email sent to customer:', order.customer.email);
        } else {
          console.warn('⚠️ SMTP credentials missing, skipping email send');
        }
      } catch (mailErr) {
        console.warn('⚠️ Failed to send completion email (non-critical):', mailErr.message);
      }
    }
    
    // Try to create notifications (but don't fail if it errors)
    try {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      
      // Create notification for customer
      if (order.customer && order.customer.email) {
        const customerUser = await User.findOne({ email: order.customer.email });
        
        if (customerUser) {
          await Notification.create({
            recipientId: customerUser._id,
            message: `Your order #${String(order._id).slice(-6)} status updated: ${oldStatus} → ${status}`,
            type: 'order_update',
            priority: 'medium',
            createdBy: req.user.id,
            orderId: order._id,
            isRead: false
          });
          console.log('✅ Customer notification created');
        }
      }
      
      // Also notify admins
      const admins = await User.find({ role: 'Admin' });
      for (const admin of admins) {
        await Notification.create({
          recipientId: admin._id,
          message: `Order #${String(order._id).slice(-6)} status updated to "${status}" by ${req.user.name}`,
          type: 'order_update',
          priority: 'medium',
          createdBy: req.user.id,
          orderId: order._id,
          isRead: false
        });
      }
      console.log(`✅ Admin notifications created (${admins.length} admins)`);
    } catch (notifError) {
      console.warn('⚠️ Notification creation failed (non-critical):', notifError.message);
      // Continue anyway - notifications are nice to have but not critical
    }
    
    console.log(`✅ Order ${order._id} status updated: ${oldStatus} → ${status} by ${req.user.name}`);
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      order
    });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
});

// @route   GET /api/orders/unassigned
// @desc    Get unassigned orders (Admin/Staff)
// @access  Private
router.get('/unassigned', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const orders = await Order.find({ 
      $or: [
        { assignedTailor: { $exists: false } },
        { assignedTailor: null },
        { assignedStaff: { $exists: false } },
        { assignedStaff: null }
      ]
    })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching unassigned orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/orders/fix-all-assignments
// @desc    Fix all tailor assignments (one-time fix)
// @access  Private (Admin only)
router.post('/fix-all-assignments', auth, allowRoles('Admin'), async (req, res) => {
  try {
    console.log('\n🔧 ===== FIXING ALL ASSIGNMENTS =====');
    console.log('Requested by:', req.user.name);
    
    // Get first tailor
    const User = require('../models/User');
    const tailors = await User.find({ role: 'Tailor' }).select('_id name');
    
    if (tailors.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No tailors found in system' 
      });
    }
    
    const tailor = tailors[0];
    console.log('Using tailor:', tailor.name, '(ID:', tailor._id, ')');
    
    // Get all orders
    const allOrders = await Order.find({});
    console.log('Total orders:', allOrders.length);
    
    // Update all orders that don't have proper assignment
    const result = await Order.updateMany(
      {
        $or: [
          { assignedTailor: null },
          { assignedTailor: { $exists: false } },
          { assignedTailor: 'tailor' }, // Fix string assignments
          { assignedTailor: '' }
        ]
      },
      {
        $set: {
          assignedTailor: tailor._id,
          status: 'Pending'
        }
      }
    );
    
    console.log('✅ Updated', result.modifiedCount, 'orders');
    
    // Verify
    const assignedCount = await Order.countDocuments({ assignedTailor: tailor._id });
    console.log('📊 Total orders now assigned to', tailor.name, ':', assignedCount);
    
    res.json({
      success: true,
      message: `Fixed ${result.modifiedCount} orders. ${assignedCount} total orders assigned to ${tailor.name}`,
      fixed: result.modifiedCount,
      totalAssigned: assignedCount,
      tailorName: tailor.name
    });
    
  } catch (error) {
    console.error('❌ Fix assignments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// @route   POST /api/orders/:id/assign-tailor
// @desc    Assign order to tailor (simple and reliable method)
// @access  Private (Admin/Staff)
router.post('/:id/assign-tailor', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { tailorId } = req.body;
    const orderId = req.params.id;
    
    console.log('🎯 ASSIGN ORDER REQUEST:', {
      orderId,
      tailorId,
      requestedBy: req.user.name
    });
    
    if (!tailorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tailor ID is required' 
      });
    }
    
    // Verify tailor exists
    const User = require('../models/User');
    const tailor = await User.findById(tailorId);
    if (!tailor) {
      console.log('❌ Tailor not found:', tailorId);
      return res.status(404).json({ 
        success: false, 
        message: 'Tailor not found' 
      });
    }
    
    if (tailor.role !== 'Tailor') {
      console.log('❌ User is not a tailor:', tailor.role);
      return res.status(400).json({ 
        success: false, 
        message: 'Selected user is not a tailor' 
      });
    }
    
    // Assign order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        assignedTailor: tailorId,
        status: 'Pending' // Set to pending when first assigned
      },
      { new: true }
    )
    .populate('customer', 'name phone email')
    .populate('assignedTailor', 'name email role');
    
    if (!order) {
      console.log('❌ Order not found:', orderId);
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    console.log('✅ ORDER ASSIGNED SUCCESSFULLY:', {
      orderId: order._id,
      assignedTo: {
        id: order.assignedTailor._id,
        name: order.assignedTailor.name,
        role: order.assignedTailor.role
      },
      status: order.status,
      customer: order.customer.name
    });
    
    res.json({ 
      success: true, 
      message: `Order assigned to ${tailor.name}`,
      order 
    });
    
  } catch (error) {
    console.error('❌ ASSIGN ORDER ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Create bill for own fabric orders after appointment (Admin only)
router.post('/:id/create-bill', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Check if order is own fabric order
    if (order.fabric?.source !== 'customer') {
      return res.status(400).json({ message: 'This order does not require manual bill creation' });
    }
    
    // Check if bill already exists
    const Bill = require('../models/Bill');
    const existingBill = await Bill.findOne({ order: order._id });
    if (existingBill) {
      return res.status(400).json({ message: 'Bill already exists for this order', bill: existingBill });
    }
    
    // Create bill
    const bill = await Bill.create({
      order: order._id,
      customer: order.customer._id,
      amount: order.totalAmount,
      paymentMethod: 'Razorpay',
      status: 'Pending',
      amountPaid: 0,
      payments: [],
    });
    
    // Update order status
    order.status = 'Order Placed';
    await order.save();
    
    console.log('💳 Bill created for own fabric order:', bill._id, 'Amount:', order.totalAmount);
    res.status(201).json({ 
      success: true,
      message: 'Bill created successfully',
      bill: bill,
      order: order
    });
  } catch (error) {
    console.error('❌ CREATE BILL ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

module.exports = router;
