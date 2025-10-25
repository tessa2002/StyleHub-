import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { FaCreditCard, FaWallet, FaHistory, FaDownload, FaPlus, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Payments.css';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [preferredBillId, setPreferredBillId] = useState('');
  const [customerQueryName, setCustomerQueryName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      await fetchPayments();
      await fetchBills();
    };
    
    fetchData();
    
    // Read customer name from query string and auto-open form
    try {
      const params = new URLSearchParams(window.location.search);
      const cname = params.get('customer');
      const shouldOpen = params.get('open');
      const billFromQs = params.get('bill');
      const amountFromQs = params.get('amount');
      const autoPayment = params.get('autoPayment');
      const fromOrder = params.get('fromOrder');
      
      if (cname) setCustomerQueryName(cname);
      if (shouldOpen === '1') setShowPaymentForm(true);
      if (amountFromQs) setPaymentAmount(amountFromQs);
      if (billFromQs) {
        setPreferredBillId(billFromQs);
        setSelectedBill(billFromQs);
      }
      
      // Auto-trigger Razorpay payment if coming from new order
      if (autoPayment === '1' && billFromQs && amountFromQs) {
        console.log('🚀 Auto-triggering Razorpay payment from new order');
        // Set Razorpay as default payment method
        setPaymentMethod('razorpay');
      }
      
      // Show special message if coming from order creation
      if (fromOrder === '1') {
        console.log('📝 Order created successfully, proceeding to payment');
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-select a pending bill and prefill amount when modal opens or bills change
  useEffect(() => {
    if (!showPaymentForm) return;
    if (!Array.isArray(bills) || bills.length === 0) return;
    // If a preferred bill id was provided, use it if found
    if (preferredBillId) {
      const b = bills.find(x => x._id === preferredBillId);
      if (b) {
        setSelectedBill(b._id);
        setPaymentAmount(String(b.amount || ''));
        return;
      }
    }
    // Try case-insensitive pending selection
    const pending = bills.filter(b => String(b.status || '').toLowerCase() === 'pending');
    if (pending.length > 0) {
      const first = pending[0];
      setSelectedBill(first._id);
      setPaymentAmount(String(first.amount || ''));
      return;
    }
    // Fallback: pick the first bill available
    const any = bills[0];
    if (any?._id) {
      setSelectedBill(any._id);
      setPaymentAmount(String(any.amount || ''));
    }
  }, [showPaymentForm, bills, preferredBillId]);

  // Auto-trigger Razorpay payment when coming from new order
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoPayment = params.get('autoPayment');
    
    if (autoPayment === '1' && showPaymentForm && bills.length > 0 && paymentMethod === 'razorpay') {
      // Small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        console.log('🚀 Auto-triggering Razorpay payment...');
        const billObj = bills.find(b => b._id === selectedBill) || bills[0];
        if (billObj && billObj.amount > 0) {
          handlePayment();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPaymentForm, bills, selectedBill, paymentMethod]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/portal/payments');
      setPayments(response.data.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      // First, check if we have a specific bill ID from URL
      const params = new URLSearchParams(window.location.search);
      const urlBillId = params.get('bill');
      
      if (urlBillId && urlBillId !== 'undefined') {
        console.log('🔍 Fetching specific bill from URL:', urlBillId);
        try {
          const billResponse = await axios.get(`/api/portal/bills/${urlBillId}`);
          if (billResponse.data.bill) {
            console.log('✅ Successfully fetched bill from URL:', billResponse.data.bill);
            setBills([billResponse.data.bill]);
            return; // Exit early - we found the bill!
          }
        } catch (billErr) {
          console.warn('⚠️ Could not fetch specific bill, trying all bills:', billErr.message);
        }
      }
      
      // If no specific bill or failed, fetch all bills
      console.log('🔍 Fetching all bills from /api/portal/bills...');
      const response = await axios.get('/api/portal/bills');
      console.log('📋 Bills response:', response.data);
      console.log('📊 Number of bills found:', response.data.bills?.length || 0);
      
      if (response.data.bills && response.data.bills.length > 0) {
        console.log('✅ Bills found:', response.data.bills);
        setBills(response.data.bills);
      } else {
        console.log('❌ No bills in response - using fallback...');
        await createTestBills();
      }
    } catch (err) {
      console.error('❌ Error fetching bills:', err);
      console.error('❌ Error details:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.log('🔄 Using fallback bill creation...');
      await createTestBills();
    }
  };

  const createTestBills = async () => {
    try {
      console.log('🧪 No bills found in database - checking URL params for bill/amount...');
      
      // Check URL parameters for bill info passed from order creation
      const params = new URLSearchParams(window.location.search);
      const urlBillId = params.get('bill');
      const urlAmount = params.get('amount');
      
      // If we have bill ID from URL, try to fetch it directly
      if (urlBillId && urlBillId !== 'undefined') {
        console.log('🔍 Attempting to fetch bill from URL:', urlBillId);
        try {
          const response = await axios.get(`/api/portal/bills/${urlBillId}`);
          if (response.data.bill) {
            console.log('✅ Fetched real bill from URL param:', response.data.bill);
            setBills([response.data.bill]);
            return;
          }
        } catch (err) {
          console.log('⚠️ Could not fetch bill from URL param, continuing...');
        }
      }
      
      // Use amount from URL if available, otherwise warn user
      const amount = urlAmount ? parseFloat(urlAmount) : null;
      
      if (!amount || amount <= 0) {
        console.error('❌ No valid amount found! Cannot create payment.');
        setBills([]);
        return;
      }
      
      console.log('💰 Using amount from URL:', amount);
      
      // Create a temporary bill with the correct amount from URL
      const mockBill = {
        _id: urlBillId || ('temp-bill-' + Date.now()),
        order: { _id: params.get('orderId') || 'unknown', itemType: 'Order', totalAmount: amount },
        amount: amount,
        status: 'Pending',
        amountPaid: 0,
        createdAt: new Date(),
        billNumber: 'TEMP-' + Math.floor(Math.random() * 10000)
      };
      
      console.log('✅ Created temporary bill with correct amount:', mockBill);
      setBills([mockBill]);
      
    } catch (err) {
      console.error('❌ Error in createTestBills:', err);
      setBills([]);
    }
  };

  const handlePayment = async () => {
    console.log('Payment attempt started:', { selectedBill, paymentAmount, paymentMethod, bills });
    
    // Check if we have any bills at all
    if (!bills || bills.length === 0) {
      console.log('🔄 No bills found, trying to create test bills...');
      await createTestBills();
      if (!bills || bills.length === 0) {
        toast.error('No bills available. Please place an order first.');
        return;
      }
    }
    
    const billObj = bills.find(b => b._id === selectedBill) || bills[0];
    if (!billObj?._id) { 
      toast.error('No bill selected. Please select a bill from the dropdown.');
      return; 
    }
    
    const amt = Number(billObj?.amount ?? paymentAmount);
    if (!(amt > 0)) { 
      toast.error(`Invalid amount: ₹${amt}. Please check the bill amount.`);
      return; 
    }
    
    if (!paymentMethod) {
      toast.error('Please select a payment method.');
      return;
    }

    // Handle Razorpay payment (includes all methods)
    if (['razorpay', 'card', 'upi', 'netbanking', 'wallet', 'emi', 'paylater'].includes(paymentMethod)) {
      await handleRazorpayPayment(billObj, amt);
      return;
    }

    // Handle mock bill payments
    if (billObj._id.startsWith('test-bill-')) {
      console.log('🧪 Processing mock bill payment...');
      setSubmitting(true);
      
      // Simulate payment processing
      setTimeout(() => {
        toast.success(`✅ Payment successful! Paid ₹${amt} via ${paymentMethod}.`);
        setSubmitting(false);
        setShowPaymentForm(false);
        setSelectedBill('');
        setPaymentAmount('');
        
        // Add to payment history
        const newPayment = {
          _id: 'payment-' + Date.now(),
          amount: amt,
          method: paymentMethod,
          status: 'completed',
          date: new Date(),
          billId: billObj._id
        };
        setPayments(prev => [newPayment, ...prev]);
        
        // Redirect to orders page
        setTimeout(() => {
          navigate('/portal/orders');
        }, 1500);
      }, 2000);
      
      return;
    }
    
    try {
      setSubmitting(true);
      console.log('Sending payment request:', {
        billId: billObj._id,
        amount: amt,
        method: paymentMethod
      });
      
      const response = await axios.post('/api/portal/payments', {
        billId: billObj._id,
        amount: amt,
        method: paymentMethod
      });
      
      console.log('Payment response:', response.data);
      
      if (response.data.success) {
        toast.success('🎉 Payment successful! Your payment has been processed.');
        await fetchPayments();
        await fetchBills();
        setShowPaymentForm(false);
        setSelectedBill('');
        setPaymentAmount('');
        
        // Redirect to orders page
        setTimeout(() => {
          navigate('/portal/orders');
        }, 1500);
      } else {
        toast.error('Payment failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Payment failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Payment failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRazorpayPayment = async (billObj, amount) => {
    try {
      setSubmitting(true);
      
      console.log('🚀 Starting Razorpay payment for bill:', billObj);
      console.log('💰 Amount:', amount);
      
      // Validate bill data
      if (!billObj || !billObj._id) {
        throw new Error('Invalid bill data');
      }
      
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay. Please check your internet connection and try again.');
        setSubmitting(false);
        return;
      }

      // Get customer info for better UX
      const customerInfo = {
        name: customerQueryName || 'Customer',
        email: 'customer@stylehub.com',
        phone: '9999999999'
      };

      // Create Razorpay order with all payment methods
      console.log('🚀 Creating Razorpay order with data:', {
        amount: amount,
        currency: 'INR',
        receipt: `receipt_${billObj._id}_${Date.now()}`,
        billId: billObj._id
      });
      
      const orderResponse = await axios.post('/api/payments/create-order', {
        amount: amount,
        currency: 'INR',
        receipt: `receipt_${billObj._id}_${Date.now()}`,
        billId: billObj._id
      });

      console.log('📋 Razorpay order response:', orderResponse.data);

      if (!orderResponse.data.success) {
        console.error('❌ Razorpay order creation failed:', orderResponse.data);
        throw new Error(orderResponse.data.message || 'Failed to create payment order');
      }

      const order = orderResponse.data.order;
      
      // Configure Razorpay options with all professional payment methods
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_RFTAqCvNfxyfF7',
        amount: order.amount,
        currency: order.currency,
        name: 'Style Hub',
        description: `Payment for Bill #${billObj._id}`,
        order_id: order.id,
        image: '/logo192.png', // Add your logo
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post('/api/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              billId: billObj._id
            });

            if (verifyResponse.data.success) {
              const params = new URLSearchParams(window.location.search);
              const fromOrder = params.get('fromOrder');
              
              // Close modal immediately
              setShowPaymentForm(false);
              setSelectedBill('');
              setPaymentAmount('');
              setSubmitting(false);
              
              // Show success toast
              if (fromOrder === '1') {
                toast.success('🎉 Payment successful! Your order has been confirmed and is now being processed.', {
                  position: 'top-center',
                  autoClose: 3000,
                  hideProgressBar: false,
                });
              } else {
                toast.success('🎉 Payment successful! Your payment has been processed.', {
                  position: 'top-center',
                  autoClose: 3000,
                  hideProgressBar: false,
                });
              }
              
              // Redirect immediately to orders page
              setTimeout(() => {
                navigate('/portal/orders', { replace: true });
              }, 1500);
            } else {
              toast.error('Payment verification failed: ' + verifyResponse.data.message);
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            toast.error('Payment verification failed. Please contact support if money was deducted.');
            setSubmitting(false);
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        notes: {
          bill_id: billObj._id,
          source: 'style_hub_app'
        },
        theme: {
          color: '#667eea',
          backdrop_color: '#f0f0f0'
        },
        // Enable all payment methods
        method: {
          netbanking: 1,
          wallet: 1,
          emi: 1,
          upi: 1,
          card: 1,
          paylater: 1
        },
        // Additional options for better UX
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setSubmitting(false);
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300, // 5 minutes
        remember_customer: true
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      
      // Handle various payment events
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error('Payment failed: ' + response.error.description, {
          position: 'top-center',
          autoClose: 5000,
        });
        setSubmitting(false);
      });

      rzp.on('payment.authorized', function (response) {
        console.log('Payment authorized:', response);
      });

      rzp.on('payment.captured', function (response) {
        console.log('Payment captured:', response);
      });
      
      rzp.open();
      
    } catch (err) {
      console.error('❌ Razorpay payment error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      toast.error('Payment failed: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      setSubmitting(false);
    }
  };

  const downloadInvoice = async (paymentId) => {
    try {
      const response = await axios.get(`/api/portal/payments/${paymentId}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      toast.error('Failed to download invoice. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'pending': return '⏳';
      case 'failed': return '✗';
      default: return '?';
    }
  };

  const effectiveBill = bills.find(x => x._id === selectedBill) || bills[0];

  return (
    <DashboardLayout>
      <div className="payments-page">
      <div className="page-header">
        <h1 className="page-title">Payments & Billing</h1>
        <p className="page-subtitle">
          {(() => {
            const params = new URLSearchParams(window.location.search);
            const fromOrder = params.get('fromOrder');
            if (fromOrder === '1') {
              return `🎉 Order created successfully! Please complete your payment to confirm your order.`;
            }
            return customerQueryName ? `Proceeding for ${customerQueryName}` : 'Manage your payments and view transaction history';
          })()}
        </p>
      </div>

      <div className="payments-content">
        {/* Payment Summary Cards */}
        <div className="payment-summary">
          <div className="summary-card">
            <div className="card-icon">
              <FaWallet />
            </div>
            <div className="card-content">
              <h3>Total Paid</h3>
              <p className="amount">₹{payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)}</p>
              <span className="label">All time</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">
              <FaHistory />
            </div>
            <div className="card-content">
              <h3>Pending Payments</h3>
              <p className="amount">₹{payments.filter(p => p.status === 'pending').reduce((sum, payment) => sum + (payment.amount || 0), 0)}</p>
              <span className="label">{payments.filter(p => p.status === 'pending').length} pending</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">
              <FaCreditCard />
            </div>
            <div className="card-content">
              <h3>Payment Methods</h3>
              <p className="amount">{new Set(payments.map(p => p.method)).size} saved</p>
              <span className="label">Cards & UPI</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button 
            className="action-btn primary"
            onClick={() => setShowPaymentForm(true)}
          >
            <FaPlus /> Make Payment
          </button>
          <button className="action-btn secondary">
            <FaDownload /> Download Statement
          </button>
          <button 
            className="action-btn secondary"
            onClick={async () => {
              try {
                console.log('🔄 Manually refreshing bills...');
                await fetchBills();
                toast.success('Bills refreshed successfully!');
              } catch (err) {
                console.error('Error refreshing bills:', err);
                toast.error('Error refreshing bills. Please try again.');
              }
            }}
          >
            🔄 Refresh Bills
          </button>
          <button 
            className="action-btn secondary"
            onClick={async () => {
              try {
                console.log('🧪 Creating test bill...');
                const response = await axios.post('/api/portal/bills/create-test');
                console.log('Test bill response:', response.data);
                toast.success('Test bill created! ' + response.data.message);
                await fetchBills();
              } catch (err) {
                console.error('Error creating test bill:', err);
                toast.error('Error creating test bill: ' + (err.response?.data?.message || err.message));
              }
            }}
          >
            🧪 Create Test Bill
          </button>
        </div>

        {/* Payment History */}
        <div className="payment-history">
          <h2>Payment History</h2>
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading payment history...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : payments.length > 0 ? (
            <div className="payments-list">
              {payments.map((payment) => (
                <div key={payment._id} className="payment-item">
                  <div className="payment-info">
                    <div className="payment-details">
                      <h4>Payment #{payment.transactionId}</h4>
                      <p className="payment-date">{new Date(payment.date).toLocaleDateString()}</p>
                      <p className="payment-description">{payment.description}</p>
                    </div>
                    <div className="payment-amount">
                      <span className="amount">₹{payment.amount}</span>
                      <span 
                        className="status"
                        style={{ color: getStatusColor(payment.status) }}
                      >
                        {getStatusIcon(payment.status)} {payment.status}
                      </span>
                    </div>
                  </div>
                  <div className="payment-actions">
                    <button 
                      className="action-btn small"
                      onClick={() => downloadInvoice(payment._id)}
                    >
                      <FaDownload /> Invoice
                    </button>
                    <button className="action-btn small">
                      <FaEye /> Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaHistory className="empty-icon" />
              <p>No payment history found</p>
              <button 
                className="action-btn primary"
                onClick={() => setShowPaymentForm(true)}
              >
                Make Your First Payment
              </button>
            </div>
          )}
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Make Payment</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowPaymentForm(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="payment-form">
                <div className="form-group">
                  <label>Select Bill</label>
                  <select 
                    value={selectedBill} 
                    onChange={(e) => {
                      setSelectedBill(e.target.value);
                      const b = bills.find(x => x._id === e.target.value);
                      setPaymentAmount(String(b?.amount || ''));
                    }}
                  >
                    <option value="">Choose a bill to pay</option>
                    {bills.filter(bill => bill.status === 'pending').map(bill => (
                      <option key={bill._id} value={bill._id}>
                        {customerQueryName ? `${customerQueryName} — ` : ''}Bill #{bill.billNumber} · ₹{bill.amount}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="text"
                    value={(effectiveBill?.amount ?? paymentAmount) ? `₹${(effectiveBill?.amount ?? paymentAmount)}` : ''}
                    readOnly
                    style={{ background:'#f3f4f6', border:'1px solid #e5e7eb', borderRadius:8, padding:'10px 12px', color:'#111827', fontWeight:700 }}
                  />
                </div>
                
                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="payment-methods">
                    <label className="method-option">
                      <input type="radio" name="method" value="card" checked={paymentMethod==='card'} onChange={() => setPaymentMethod('card')} />
                      <span>💳 Credit/Debit Card</span>
                    </label>
                    <label className="method-option">
                      <input type="radio" name="method" value="upi" checked={paymentMethod==='upi'} onChange={() => setPaymentMethod('upi')} />
                      <span>📱 UPI (GPay, PhonePe, Paytm)</span>
                    </label>
                    <label className="method-option">
                      <input type="radio" name="method" value="netbanking" checked={paymentMethod==='netbanking'} onChange={() => setPaymentMethod('netbanking')} />
                      <span>🏦 Net Banking (All Major Banks)</span>
                    </label>
                    <label className="method-option">
                      <input type="radio" name="method" value="wallet" checked={paymentMethod==='wallet'} onChange={() => setPaymentMethod('wallet')} />
                      <span>💰 Digital Wallets (Paytm, Mobikwik)</span>
                    </label>
                    <label className="method-option">
                      <input type="radio" name="method" value="emi" checked={paymentMethod==='emi'} onChange={() => setPaymentMethod('emi')} />
                      <span>📅 EMI Options</span>
                    </label>
                    <label className="method-option">
                      <input type="radio" name="method" value="paylater" checked={paymentMethod==='paylater'} onChange={() => setPaymentMethod('paylater')} />
                      <span>⏰ Pay Later (Simpl, LazyPay)</span>
                    </label>
                    <label className="method-option razorpay-option">
                      <input type="radio" name="method" value="razorpay" checked={paymentMethod==='razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                      <span>🚀 Razorpay (All Methods)</span>
                      <small>Secure payment gateway with all options</small>
                    </label>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="btn secondary"
                    onClick={() => setShowPaymentForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn primary"
                    disabled={submitting}
                    onClick={() => {
                      console.log('Pay Now clicked!', { 
                        selectedBill, 
                        paymentAmount, 
                        paymentMethod, 
                        effectiveBill,
                        bills: bills.length,
                        submitting 
                      });
                      handlePayment();
                    }}
                  >
                    {submitting ? 'Processing…' : 'Pay Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentsPage;
