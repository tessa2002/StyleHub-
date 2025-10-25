import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { FaSearch, FaPlus, FaEye, FaTrash } from 'react-icons/fa';
import './Billing.css';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [billsRes, paymentsRes] = await Promise.allSettled([
        axios.get('/api/bills'),
        axios.get('/api/payments')
      ]);

      console.log('Bills response:', billsRes);
      console.log('Payments response:', paymentsRes);

      const billsData = billsRes.status === 'fulfilled' ? billsRes.value.data : {};
      const paymentsData = paymentsRes.status === 'fulfilled' ? paymentsRes.value.data : {};
      
      // Backend returns: billsData.items and paymentsData.payments
      const billsList = Array.isArray(billsData.items) ? billsData.items : (Array.isArray(billsData.bills) ? billsData.bills : []);
      const paymentsList = Array.isArray(paymentsData.payments) ? paymentsData.payments : [];
      
      setBills(billsList);
      setPayments(paymentsList);
      
      console.log('Bills loaded:', billsList.length);
      console.log('Payments loaded:', paymentsList.length);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      setBills([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async (orderId) => {
    try {
      const response = await axios.post('/api/bills/generate', { orderId });
      setBills([...bills, response.data.bill]);
      alert('Bill generated successfully');
      fetchBillingData(); // Refresh data
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Error generating bill: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await axios.delete(`/api/bills/${billId}`);
        setBills(bills.filter(bill => (bill.id || bill._id) !== billId));
        alert('Bill deleted successfully');
        fetchBillingData(); // Refresh data
      } catch (error) {
        console.error('Error deleting bill:', error);
        alert('Error deleting bill: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const filteredBills = Array.isArray(bills) ? bills.filter(bill => {
    const customerName = bill.order?.customer?.name || bill.customerName || '';
    const billNumber = bill.billNumber || bill.invoiceNumber || '';
    const billId = bill._id || bill.id || '';
    
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         billId.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  const filteredPayments = Array.isArray(payments) ? payments.filter(payment => {
    const customerName = payment.order?.customer?.name || payment.customerName || '';
    const transactionId = payment.razorpayPaymentId || payment.transactionId || '';
    const paymentId = payment._id || payment.id || '';
    
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paymentId.toString().includes(searchTerm);
    const matchesType = filterType === 'all' || payment.paymentMethod === filterType;
    return matchesSearch && matchesType;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
      case 'paid':
      case 'completed': return '#10b981';
      case 'Pending':
      case 'pending': return '#f59e0b';
      case 'Partial':
      case 'partial': return '#3b82f6';
      case 'Unpaid':
      case 'unpaid': return '#ef4444';
      case 'overdue': return '#dc2626';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'UPI': return '📱';
      case 'Cash': return '💵';
      case 'Card': return '💳';
      case 'Bank Transfer': return '🏦';
      default: return '💰';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="billing-page">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading billing data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="billing-page">
        <div className="page-header">
          <h1>Billing & Payments</h1>
          <p>Manage invoices, bills, and payment tracking</p>
        </div>

        {/* Financial Overview */}
        <div className="financial-overview">
          <div className="overview-card">
            <h3>Total Revenue</h3>
            <p className="amount">₹{bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString()}</p>
          </div>
          <div className="overview-card">
            <h3>Pending Amount</h3>
            <p className="amount pending">₹{bills.filter(b => b.status === 'Pending' || b.status === 'Unpaid').reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString()}</p>
          </div>
          <div className="overview-card">
            <h3>Overdue Amount</h3>
            <p className="amount overdue">₹{bills.filter(b => {
              const dueDate = new Date(b.dueDate);
              const now = new Date();
              return b.status !== 'Paid' && dueDate < now;
            }).reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="controls-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search bills and payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Payment Types</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* Bills Section */}
        <div className="bills-section">
          <div className="section-header">
            <h2>Bills & Invoices ({filteredBills.length})</h2>
            <button className="btn btn-primary" onClick={() => handleGenerateBill('new')}>
              <FaPlus /> Generate Bill
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length > 0 ? (
                  filteredBills.map(bill => {
                    const billId = bill._id || bill.id;
                    const customerName = bill.order?.customer?.name || bill.customerName || 'N/A';
                    const billNumber = bill.billNumber || bill.invoiceNumber || billId?.toString().slice(-6);
                    const dueDate = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A';
                    
                    return (
                      <tr key={billId}>
                        <td>{billNumber}</td>
                        <td>
                          <div>
                            <div>{customerName}</div>
                            {bill.order?.customer?.phone && (
                              <small style={{ color: '#666' }}>{bill.order.customer.phone}</small>
                            )}
                          </div>
                        </td>
                        <td>₹{(bill.amount || 0).toLocaleString()}</td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(bill.status) }}>
                            {bill.status}
                          </span>
                        </td>
                        <td>{dueDate}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-icon view" onClick={() => window.open(`/api/bills/${billId}/invoice`, '_blank')}>
                              <FaEye />
                            </button>
                            <button 
                              onClick={() => handleDeleteBill(billId)}
                              className="btn-icon delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No bills found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Section */}
        <div className="payments-section">
          <div className="section-header">
            <h2>Payment History ({filteredPayments.length})</h2>
          </div>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map(payment => {
                    const paymentId = payment._id || payment.id;
                    const customerName = payment.order?.customer?.name || payment.customerName || 'N/A';
                    const transactionId = payment.razorpayPaymentId || payment.transactionId || paymentId?.toString().slice(-8);
                    const method = payment.paymentMethod || 'Razorpay';
                    const date = payment.paidAt || payment.createdAt;
                    const formattedDate = date ? new Date(date).toLocaleDateString() : 'N/A';
                    
                    return (
                      <tr key={paymentId}>
                        <td>{transactionId}</td>
                        <td>{customerName}</td>
                        <td>₹{(payment.amount || 0).toLocaleString()}</td>
                        <td>
                          <span className="payment-method">
                            {getPaymentMethodIcon(method)} {method}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(payment.status) }}>
                            {payment.status || 'completed'}
                          </span>
                        </td>
                        <td>{formattedDate}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No payments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;