import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FaShoppingBag, FaPlus, FaSearch, FaEdit, FaTrash, FaEye,
  FaUser, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaFilter, FaDownload, FaPrint, FaUserTie, FaFileInvoice,
  FaMoneyBillWave, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Orders.css';

const EnhancedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [bills, setBills] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGarment, setFilterGarment] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  
  // Assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);
  const [selectedTailor, setSelectedTailor] = useState('');

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, tailorsRes, billsRes] = await Promise.allSettled([
        axios.get('/api/orders'),
        axios.get('/api/users?role=Tailor'),
        axios.get('/api/bills')
      ]);

      const ordersData = ordersRes.status === 'fulfilled' ? ordersRes.value.data : {};
      const tailorsData = tailorsRes.status === 'fulfilled' ? tailorsRes.value.data : {};
      const billsData = billsRes.status === 'fulfilled' ? billsRes.value.data : {};

      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : []);
      setTailors(Array.isArray(tailorsData.users) ? tailorsData.users : []);
      
      // Create bills lookup by order ID
      const billsMap = {};
      if (Array.isArray(billsData.bills)) {
        billsData.bills.forEach(bill => {
          if (bill.order) {
            billsMap[bill.order._id || bill.order] = bill;
          }
        });
      }
      setBills(billsMap);

    } catch (error) {
      console.error('Error fetching data:', error);
      setOrders([]);
      setTailors([]);
      setBills({});
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTailor = async () => {
    if (!selectedOrderForAssign || !selectedTailor) {
      toast.error('Please select a tailor');
      return;
    }

    try {
      await axios.put(`/api/orders/${selectedOrderForAssign._id}/assign`, {
        tailorId: selectedTailor
      });

      // Update local state
      setOrders(orders.map(order => 
        order._id === selectedOrderForAssign._id
          ? { ...order, assignedTailor: { _id: selectedTailor, name: tailors.find(t => t._id === selectedTailor)?.name } }
          : order
      ));

      toast.success('Tailor assigned successfully!');
      setShowAssignModal(false);
      setSelectedOrderForAssign(null);
      setSelectedTailor('');
    } catch (error) {
      console.error('Error assigning tailor:', error);
      toast.error('Failed to assign tailor');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update status');
    }
  };

  const handlePaymentUpdate = async () => {
    if (!selectedOrderForPayment || !paymentAmount) {
      toast.error('Please enter payment amount');
      return;
    }

    try {
      const bill = bills[selectedOrderForPayment._id];
      if (bill) {
        await axios.post(`/api/bills/${bill._id}/add-payment`, {
          amount: parseFloat(paymentAmount),
          paymentMethod: paymentMethod
        });
      } else {
        // Create bill first
        await axios.post('/api/bills/generate', {
          orderId: selectedOrderForPayment._id,
          amount: parseFloat(paymentAmount),
          paymentMethod: paymentMethod
        });
      }

      toast.success('Payment recorded successfully!');
      setShowPaymentModal(false);
      setSelectedOrderForPayment(null);
      setPaymentAmount('');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const bill = bills[orderId];
      if (!bill) {
        toast.error('No bill found for this order');
        return;
      }

      const response = await axios.get(`/api/bills/${bill._id}/invoice`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bill.billNumber || orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Invoice downloaded!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`/api/orders/${orderId}`);
        setOrders(orders.filter(order => order._id !== orderId));
        toast.success('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Failed to delete order');
      }
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const customerName = order.customer?.name || '';
    const garmentType = order.itemType || '';
    const orderId = order._id || '';
    
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         garmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orderId.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesGarment = filterGarment === 'all' || garmentType === filterGarment;
    
    // Payment filter
    const bill = bills[order._id];
    let matchesPayment = true;
    if (filterPayment !== 'all') {
      if (!bill) matchesPayment = filterPayment === 'Pending';
      else matchesPayment = bill.status === filterPayment;
    }
    
    return matchesSearch && matchesStatus && matchesGarment && matchesPayment;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed': return '#3b82f6';
      case 'Cutting': return '#f59e0b';
      case 'Stitching': return '#ec4899';
      case 'Trial': return '#8b5cf6';
      case 'Ready': return '#10b981';
      case 'Delivered': return '#059669';
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#10b981';
      case 'Partial': return '#f59e0b';
      case 'Pending': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="orders-page">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="orders-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Orders Management</h1>
            <p>View all customer orders, assign tailors, and manage payments</p>
          </div>
          <div className="header-actions">
            <Link to="/admin/reports" className="btn btn-outline">
              <FaFileInvoice /> View Reports
            </Link>
            <Link to="/admin/orders/new" className="btn btn-primary">
              <FaPlus /> Create Order
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by customer, order ID, or garment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Cutting">Cutting</option>
              <option value="Stitching">Stitching</option>
              <option value="Trial">Trial</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Garment</label>
            <select value={filterGarment} onChange={(e) => setFilterGarment(e.target.value)}>
              <option value="all">All Garments</option>
              <option value="Shirt">Shirt</option>
              <option value="Pants">Pants</option>
              <option value="Blouse">Blouse</option>
              <option value="Suit">Suit</option>
              <option value="Dress">Dress</option>
              <option value="Lehenga">Lehenga</option>
              <option value="Kurta">Kurta</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Payment</label>
            <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
              <option value="all">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Garment</th>
                <th>Status</th>
                <th>Assigned Tailor</th>
                <th>Delivery Date</th>
                <th>Payment Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const bill = bills[order._id];
                return (
                  <tr key={order._id}>
                    <td>
                      <div className="order-id">
                        <span className="id-number">#{order._id?.slice(-6)}</span>
                        <span className="created-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{order.customer?.name || 'N/A'}</div>
                        <div className="customer-phone">{order.customer?.phone || ''}</div>
                      </div>
                    </td>
                    <td>
                      <span className="garment-type">{order.itemType || 'N/A'}</span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="status-select"
                        style={{ 
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Cutting">Cutting</option>
                        <option value="Stitching">Stitching</option>
                        <option value="Trial">Trial</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="assigned-info">
                        {order.assignedTailor ? (
                          <div className="assigned-staff">
                            <FaUserTie className="staff-icon" />
                            <span>{order.assignedTailor.name || order.assignedTailor}</span>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              setSelectedOrderForAssign(order);
                              setShowAssignModal(true);
                            }}
                          >
                            <FaUserTie /> Assign
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="delivery-info">
                        <FaCalendarAlt className="date-icon" />
                        <span>
                          {order.expectedDelivery 
                            ? new Date(order.expectedDelivery).toLocaleDateString()
                            : 'Not set'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="payment-badge"
                        style={{
                          backgroundColor: getPaymentStatusColor(bill?.status || 'Pending'),
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          fontSize: '12px'
                        }}
                      >
                        {bill?.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="amount-info">
                        <span className="amount">₹{order.totalAmount?.toLocaleString() || '0'}</span>
                        {bill && bill.amountPaid > 0 && (
                          <span className="paid-amount">
                            Paid: ₹{bill.amountPaid.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/admin/orders/${order._id}`}
                          className="btn btn-sm btn-outline"
                          title="View Details"
                        >
                          <FaEye />
                        </Link>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            setSelectedOrderForPayment(order);
                            setPaymentAmount(order.totalAmount - (bill?.amountPaid || 0));
                            setShowPaymentModal(true);
                          }}
                          title="Manage Payment"
                        >
                          <FaMoneyBillWave />
                        </button>
                        {bill && (
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => downloadInvoice(order._id)}
                            title="Download Invoice"
                          >
                            <FaDownload />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(order._id)}
                          className="btn btn-sm btn-danger"
                          title="Delete Order"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="empty-state">
              <FaShoppingBag className="empty-icon" />
              <h3>No orders found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Assign Tailor Modal */}
        {showAssignModal && (
          <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Assign Tailor</h2>
                <button className="close-btn" onClick={() => setShowAssignModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <p>Order: #{selectedOrderForAssign?._id?.slice(-6)}</p>
                <p>Customer: {selectedOrderForAssign?.customer?.name}</p>
                <div className="form-group">
                  <label>Select Tailor:</label>
                  <select
                    value={selectedTailor}
                    onChange={(e) => setSelectedTailor(e.target.value)}
                    className="form-control"
                  >
                    <option value="">-- Select Tailor --</option>
                    {tailors.map(tailor => (
                      <option key={tailor._id} value={tailor._id}>
                        {tailor.name} - {tailor.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleAssignTailor}>
                  Assign Tailor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Record Payment</h2>
                <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <p>Order: #{selectedOrderForPayment?._id?.slice(-6)}</p>
                <p>Customer: {selectedOrderForPayment?.customer?.name}</p>
                <p>Total Amount: ₹{selectedOrderForPayment?.totalAmount?.toLocaleString()}</p>
                {bills[selectedOrderForPayment?._id] && (
                  <p>Already Paid: ₹{bills[selectedOrderForPayment._id].amountPaid?.toLocaleString()}</p>
                )}
                <div className="form-group">
                  <label>Payment Amount:</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="form-control"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-control"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Razorpay">Razorpay</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handlePaymentUpdate}>
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EnhancedOrders;

