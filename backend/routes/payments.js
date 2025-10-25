const express = require('express');
const Razorpay = require('razorpay');
const { auth, allowRoles } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Test endpoint to verify Razorpay integration
router.get('/test', async (req, res) => {
  try {
    // Test Razorpay connection by creating a small test order
    const testOrder = await razorpay.orders.create({
      amount: 100, // 1 rupee in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`
    });
    
    res.json({ 
      success: true, 
      message: 'Razorpay integration is working!',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RFTAqCvNfxyfF7',
      testOrderId: testOrder.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Razorpay connection failed',
      error: error.message,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RFTAqCvNfxyfF7'
    });
  }
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RFTAqCvNfxyfF7',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'xsIhRgfdWFDudNmxxiQXY1Fx',
});

// Create a payment order with all professional payment methods
router.post('/create-order', async (req, res) => {
  try {
    console.log('🚀 Creating Razorpay order with data:', req.body);
    console.log('🔑 Razorpay Key ID:', process.env.RAZORPAY_KEY_ID || 'rzp_test_RFTAqCvNfxyfF7');
    
    const { amount, currency = 'INR', receipt, billId, customerInfo } = req.body;
    
    if (!amount || amount <= 0) {
      console.log('❌ Invalid amount:', amount);
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Generate short receipt ID (max 40 chars for Razorpay)
    const shortReceipt = receipt 
      ? receipt.substring(0, 40)  // Truncate if too long
      : `rcpt_${Date.now().toString().substring(3)}`; // Short format: rcpt_147858218
    
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: shortReceipt,
      notes: {
        billId: billId || '',
        userId: req.user?.id || 'test_user',
        source: 'style_hub_app'
      }
    };
    
    // Add customer info if provided and valid
    if (customerInfo && customerInfo.name) {
      options.customer = {
        name: customerInfo.name,
        email: customerInfo.email || 'customer@stylehub.com',
        contact: customerInfo.phone || '9999999999'
      };
    }

    console.log('📤 Sending request to Razorpay with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created successfully:', order.id);
    
    res.json({ 
      success: true, 
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      },
      // Return available payment methods
      paymentMethods: {
        card: true,
        netbanking: true,
        wallet: true,
        upi: true,
        emi: true,
        paylater: true
      }
    });
  } catch (e) {
    console.error('❌ Razorpay order creation error:', e);
    console.error('❌ Error details:', {
      message: e.message,
      statusCode: e.statusCode,
      response: e.response?.data,
      stack: e.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order', 
      error: e.message,
      details: e.response?.data || 'No additional details',
      stack: e.stack
    });
  }
});

// Verify payment signature (test-friendly version)
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billId } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    // Create signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update bill status and create payment record if billId is provided
      if (billId) {
        try {
          const Bill = require('../models/Bill');
          const Payment = require('../models/Payment');
          const bill = await Bill.findById(billId);
          
          if (bill) {
            // Get payment details from Razorpay
            let paymentAmount = bill.amount;
            try {
              const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
              paymentAmount = paymentDetails.amount / 100; // Convert from paise to rupees
            } catch (e) {
              console.log('Could not fetch payment details from Razorpay, using bill amount');
            }

            // Update bill
            bill.amountPaid = bill.amount;
            bill.paymentMethod = 'Razorpay';
            bill.recomputeStatus();
            await bill.save();

            // Create payment record
            await Payment.create({
              bill: bill._id,
              customer: bill.customer,
              amount: paymentAmount,
              method: 'Razorpay',
              status: 'completed',
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
              transactionId: razorpay_payment_id,
              paidAt: new Date()
            });

            console.log('✅ Payment record created for bill:', bill._id);
          }
        } catch (dbError) {
          console.log('ℹ️  Database not available, payment verified but not saved to DB');
          console.error('DB Error:', dbError);
        }
      }

      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (e) {
    console.error('Payment verification error:', e.message);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

// Get payment methods available for an order
router.get('/methods', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.query;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Return all available payment methods
    res.json({
      success: true,
      paymentMethods: {
        card: {
          enabled: true,
          types: ['credit', 'debit'],
          providers: ['visa', 'mastercard', 'amex', 'rupay']
        },
        netbanking: {
          enabled: true,
          banks: [
            'HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'PNB', 'BOI', 'CANARA',
            'UNION', 'BANDHAN', 'INDUSIND', 'YES', 'FEDERAL', 'IDBI'
          ]
        },
        wallet: {
          enabled: true,
          providers: ['paytm', 'mobikwik', 'freecharge', 'jio_money', 'airtel_money']
        },
        upi: {
          enabled: true,
          apps: ['gpay', 'phonepe', 'paytm', 'bhim', 'amazon_pay']
        },
        emi: {
          enabled: true,
          providers: ['hdfc', 'icici', 'kotak', 'bajaj', 'home_credit']
        },
        paylater: {
          enabled: true,
          providers: ['lazy_pay', 'simpl', 'zest_money', 'epay_later']
        }
      }
    });
  } catch (e) {
    console.error('Get payment methods error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to get payment methods' });
  }
});

// Create payment link for sharing
router.post('/create-payment-link', async (req, res) => {
  try {
    const { amount, currency = 'INR', description, customerInfo, billId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100,
      currency,
      description: description || `Payment for Bill #${billId}`,
      customer: customerInfo ? {
        name: customerInfo.name || 'Customer',
        email: customerInfo.email || 'customer@stylehub.com',
        contact: customerInfo.phone || '9999999999'
      } : undefined,
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      notes: {
        billId: billId || '',
        userId: req.user?.id || 'test_user',
        source: 'style_hub_app'
      }
    };

    const paymentLink = await razorpay.paymentLink.create(options);
    
    res.json({
      success: true,
      paymentLink: {
        id: paymentLink.id,
        short_url: paymentLink.short_url,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        status: paymentLink.status
      }
    });
  } catch (e) {
    console.error('Create payment link error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to create payment link' });
  }
});

// Get payment details
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    
    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        description: payment.description,
        created_at: payment.created_at,
        captured: payment.captured
      }
    });
  } catch (e) {
    console.error('Get payment details error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to get payment details' });
  }
});

// Refund payment
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, notes } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }

    const options = {
      payment_id: paymentId,
      amount: amount ? amount * 100 : undefined, // Partial refund if amount specified
      notes: notes || { reason: 'Customer request' }
    };

    const refund = await razorpay.payments.refund(paymentId, options);
    
    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        created_at: refund.created_at
      }
    });
  } catch (e) {
    console.error('Refund error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to process refund' });
  }
});

// List all payments (Admin/Staff)
router.get('/', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('bill', 'billNumber amount')
      .populate('order', 'customer')
      .lean();

    console.log(`💰 Fetched ${payments.length} payments for admin`);
    res.json({ success: true, payments });
  } catch (e) {
    console.error('List payments error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify payment webhook
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (signature === expectedSignature) {
      // Handle webhook events
      const event = req.body;
      console.log('Razorpay webhook received:', event.event);
      
      // Process different webhook events
      switch (event.event) {
        case 'payment.captured':
          console.log('Payment captured:', event.payload.payment.entity.id);
          // Update bill status to paid
          await handlePaymentCaptured(event.payload.payment.entity);
          break;
        case 'payment.failed':
          console.log('Payment failed:', event.payload.payment.entity.id);
          // Handle failed payment
          await handlePaymentFailed(event.payload.payment.entity);
          break;
        case 'payment.authorized':
          console.log('Payment authorized:', event.payload.payment.entity.id);
          break;
        case 'refund.created':
          console.log('Refund created:', event.payload.refund.entity.id);
          break;
        default:
          console.log('Unhandled webhook event:', event.event);
      }
      
      res.json({ received: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (e) {
    console.error('Webhook verification error:', e.message);
    res.status(500).json({ success: false, message: 'Webhook verification failed' });
  }
});

// Helper function to handle payment captured
async function handlePaymentCaptured(payment) {
  try {
    const Bill = require('../models/Bill');
    const bill = await Bill.findOne({ 'notes.billId': payment.notes?.billId });
    if (bill) {
      bill.amountPaid = bill.amount;
      bill.paymentMethod = 'Razorpay';
      bill.recomputeStatus();
      await bill.save();
      console.log('Bill status updated to paid:', bill._id);
    }
  } catch (error) {
    console.error('Error updating bill status:', error);
  }
}

// Helper function to handle payment failed
async function handlePaymentFailed(payment) {
  try {
    console.log('Payment failed for bill:', payment.notes?.billId);
    // You can add logic here to notify customer or update order status
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

module.exports = router;