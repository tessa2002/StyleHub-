const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');
const Bill = require('../models/Bill');
const Order = require('../models/Order');

const router = express.Router();

// Generate a bill for an order (Admin/Staff)
router.post('/generate', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const existing = await Bill.findOne({ order: orderId });
    if (existing) return res.status(400).json({ success: false, message: 'Bill already exists for this order' });

    const bill = await Bill.create({
      order: orderId,
      amount: amount ?? order.totalAmount ?? 0,
      paymentMethod: paymentMethod || 'Cash',
      status: 'Unpaid',
      amountPaid: 0,
      payments: [],
    });

    res.status(201).json({ success: true, bill });
  } catch (e) {
    console.error('Generate bill error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// List bills with filters and pagination
// GET /api/bills?status=Paid|Partial|Unpaid&q=term&page=1&limit=10
router.get('/', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { status, q = '', page = 1, limit = 10 } = req.query;
    const p = Math.max(1, Number(page));
    const l = Math.max(1, Math.min(100, Number(limit)));
    const skip = (p - 1) * l;

    const filter = {};
    if (status && ['Paid', 'Partial', 'Unpaid'].includes(status)) filter.status = status;

    // Basic text search over status/amount and order id string
    const term = String(q || '').trim();
    if (term) {
      const mongoose = require('mongoose');
      const maybeId = mongoose.isValidObjectId(term) ? [term] : [];
      filter.$or = [
        { status: { $regex: term, $options: 'i' } },
        { amount: isNaN(Number(term)) ? -1 : Number(term) },
        ...(maybeId.length ? [{ order: { $in: maybeId } }, { _id: { $in: maybeId } }] : []),
      ];
    }

    const [items, total] = await Promise.all([
      Bill.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .populate({ path: 'order', select: 'customer totalAmount createdAt', populate: { path: 'customer', select: 'name phone' } })
        .lean(),
      Bill.countDocuments(filter),
    ]);

    res.json({ success: true, items, total, page: p, pages: Math.ceil(total / l) });
  } catch (e) {
    console.error('List bills error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get bill by id
router.get('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate({ path: 'order', populate: { path: 'customer', select: 'name phone email' } });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get bill by order id
router.get('/by-order/:orderId', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const bill = await Bill.findOne({ order: req.params.orderId }).populate({ path: 'order', populate: { path: 'customer', select: 'name phone email' } });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Record a payment against a bill
router.post('/:id/payments', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { amount, method, reference } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });
    if (!['Cash','Card','UPI'].includes(method)) return res.status(400).json({ success: false, message: 'Invalid method' });

    bill.payments.push({ amount, method, reference });
    bill.amountPaid = (bill.amountPaid || 0) + Number(amount);
    bill.recomputeStatus();
    await bill.save();

    res.json({ success: true, bill });
  } catch (e) {
    console.error('Record payment error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get invoice/receipt for a bill (HTML format)
router.get('/:id/invoice', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate({
        path: 'order',
        populate: { path: 'customer', select: 'name email phone address' }
      })
      .populate('customer');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // Generate HTML invoice
    const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${bill.billNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #667eea; margin: 0; }
        .header p { color: #666; margin: 5px 0; }
        .info-section { margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .info-row .label { font-weight: bold; color: #333; }
        .info-row .value { color: #666; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
        .items-table td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; padding: 15px; background: #f9f9f9; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        .status { padding: 5px 10px; border-radius: 5px; font-size: 12px; }
        .status.paid { background: #d1fae5; color: #065f46; }
        .status.pending { background: #fee2e2; color: #991b1b; }
        .status.partial { background: #fef3c7; color: #92400e; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Style Hub</h1>
        <p>Tailoring & Stitching Services</p>
        <p>Email: support@stylehub.com | Phone: +91 99999 99999</p>
      </div>

      <h2 style="text-align: center; color: #667eea;">INVOICE</h2>

      <div class="info-section">
        <div class="info-row">
          <span class="label">Invoice Number:</span>
          <span class="value">${bill.billNumber || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Date:</span>
          <span class="value">${new Date(bill.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="info-row">
          <span class="label">Customer Name:</span>
          <span class="value">${bill.order?.customer?.name || bill.customer?.name || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Customer Phone:</span>
          <span class="value">${bill.order?.customer?.phone || bill.customer?.phone || 'N/A'}</span>
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

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${bill.order?.itemType || 'Custom Garment'}</td>
            <td>1</td>
            <td>₹${bill.amount.toFixed(2)}</td>
            <td>₹${bill.amount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="info-section">
        <h3>Payment Details</h3>
        <div class="info-row">
          <span class="label">Total Amount:</span>
          <span class="value">₹${bill.amount.toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="label">Amount Paid:</span>
          <span class="value">₹${bill.amountPaid.toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="label">Balance Due:</span>
          <span class="value">₹${(bill.amount - bill.amountPaid).toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="label">Payment Method:</span>
          <span class="value">${bill.paymentMethod || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Payment Status:</span>
          <span class="value">
            <span class="status ${bill.status.toLowerCase()}">${bill.status}</span>
          </span>
        </div>
        ${bill.paidAt ? `<div class="info-row"><span class="label">Paid On:</span><span class="value">${new Date(bill.paidAt).toLocaleDateString()}</span></div>` : ''}
      </div>

      <div class="total">
        Total: ₹${bill.amount.toFixed(2)}
      </div>

      <div class="footer">
        <p>Thank you for choosing Style Hub!</p>
        <p>For any queries, please contact us at support@stylehub.com</p>
        <button onclick="window.print()" class="no-print" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Print Invoice
        </button>
      </div>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(invoiceHTML);

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add payment to bill
router.post('/:id/add-payment', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    bill.amountPaid += parseFloat(amount);
    bill.paymentMethod = paymentMethod || bill.paymentMethod;
    bill.recomputeStatus();
    await bill.save();

    res.json({ success: true, bill });

  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;