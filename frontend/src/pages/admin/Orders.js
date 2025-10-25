import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FaShoppingBag, FaPlus, FaSearch, FaEdit, FaTrash, FaEye,
  FaUser, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaFilter, FaDownload, FaPrint, FaUserTie
} from 'react-icons/fa';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGarment, setFilterGarment] = useState('all');
  
  // Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTailorId, setSelectedTailorId] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchTailors();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders from /api/orders...');
      const response = await axios.get('/api/orders');
      console.log('Orders response:', response.data);
      
      // Handle the API response format: { success: true, orders: [...] }
      const ordersData = response.data.orders || response.data || [];
      console.log('Orders data:', ordersData);
      console.log('Number of orders:', Array.isArray(ordersData) ? ordersData.length : 0);
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response?.data);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTailors = async () => {
    try {
      console.log('Fetching tailors from /api/tailors...');
      const response = await axios.get('/api/tailors');
      console.log('Tailors response:', response.data);
      
      // Handle both response formats: direct array or { success: true, users: [...] }
      const tailorsList = response.data.users || (Array.isArray(response.data) ? response.data : []);
      console.log('Tailors found:', tailorsList.length, tailorsList);
      
      setTailors(tailorsList);
    } catch (error) {
      console.error('Error fetching tailors:', error.response?.data || error.message);
      setTailors([]);
    }
  };

  const handleAssignOrder = async () => {
    if (!selectedOrder || !selectedTailorId) {
      alert('Please select a tailor');
      return;
    }

    try {
      console.log('🎯 Assigning order:', {
        orderId: selectedOrder._id,
        tailorId: selectedTailorId,
        tailorName: tailors.find(t => t._id === selectedTailorId)?.name
      });

      // Use the new assign-tailor endpoint with better logging
      const response = await axios.post(`/api/orders/${selectedOrder._id}/assign-tailor`, {
        tailorId: selectedTailorId
      });

      console.log('✅ Assignment response:', response.data);

      // Update local state with the returned order data
      if (response.data.success && response.data.order) {
        setOrders(orders.map(order => 
          order._id === selectedOrder._id ? response.data.order : order
        ));
      } else {
        // Fallback to manual update
        setOrders(orders.map(order => 
          order._id === selectedOrder._id
            ? { 
                ...order, 
                assignedTailor: { 
                  _id: selectedTailorId, 
                  name: tailors.find(t => t._id === selectedTailorId)?.name 
                } 
              }
            : order
        ));
      }

      const assignedTailorName = tailors.find(t => t._id === selectedTailorId)?.name || 'Tailor';
      alert(`✅ Order assigned to ${assignedTailorName} successfully!\n\nThe tailor can now see this order in their dashboard.`);
      setShowAssignModal(false);
      setSelectedOrder(null);
      setSelectedTailorId('');
      
      // Refresh orders to ensure we have latest data
      await fetchOrders();
    } catch (error) {
      console.error('❌ Error assigning tailor:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to assign tailor: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => {
        const id = order._id || order.id;
        return id === orderId ? { ...order, status: newStatus } : order;
      }));
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`/api/orders/${orderId}`);
        setOrders(orders.filter(order => {
          const id = order._id || order.id;
          return id !== orderId;
        }));
        fetchOrders(); // Refresh orders
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const customerName = order.customer?.name || order.customerName || '';
    const garmentType = order.itemType || order.garmentType || order.items?.[0]?.name || 'Custom Order';
    const orderId = order._id || order.id || '';
    
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         garmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orderId.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesGarment = filterGarment === 'all' || garmentType.toLowerCase().includes(filterGarment.toLowerCase());
    return matchesSearch && matchesStatus && matchesGarment;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed': return '#3b82f6'; // Blue
      case 'Cutting': return '#8b5cf6'; // Purple
      case 'Stitching': return '#f59e0b'; // Orange
      case 'Trial': return '#06b6d4'; // Cyan
      case 'Ready': return '#10b981'; // Green
      case 'Delivered': return '#059669'; // Dark Green
      case 'Cancelled': return '#ef4444'; // Red
      case 'Pending': return '#6b7280'; // Gray
      case 'New': return '#3b82f6';
      case 'In Progress': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <FaCheckCircle />;
      case 'Ready': return <FaCheckCircle />;
      case 'Cancelled': return <FaTrash />;
      case 'Order Placed': return <FaClock />;
      case 'Cutting': return <FaClock />;
      case 'Stitching': return <FaClock />;
      case 'Trial': return <FaClock />;
      case 'New': return <FaClock />;
      case 'In Progress': return <FaExclamationTriangle />;
      default: return <FaClock />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
            <p>Manage all customer orders and track their progress</p>
          </div>
          <div className="header-actions">
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
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
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
            <select
              value={filterGarment}
              onChange={(e) => setFilterGarment(e.target.value)}
            >
              <option value="all">All Garments</option>
              <option value="Shirt">Shirt</option>
              <option value="Pant">Pant</option>
              <option value="Suit">Suit</option>
              <option value="Dress">Dress</option>
              <option value="Blouse">Blouse</option>
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
                <th>Assigned To</th>
                <th>Delivery Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="empty-state">
                      <FaShoppingBag style={{ fontSize: '48px', color: '#cbd5e0', marginBottom: '16px' }} />
                      <p>No orders found</p>
                      <p style={{ fontSize: '14px', color: '#718096' }}>Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const orderId = order._id?.toString() || order.id;
                  const customerName = order.customer?.name || order.customerName || 'Unknown Customer';
                  const customerId = order.customer?._id || order.customerId || '';
                  const garmentType = order.itemType || order.garmentType || order.items?.[0]?.name || 'Custom Order';
                  const assignedName = order.assignedTailor?.name || order.assignedTo || null;
                  const deliveryDate = order.expectedDelivery || order.deliveryDate;
                  
                  return (
                    <tr key={orderId}>
                      <td>
                        <div className="order-id">
                          <span className="id-number">#{orderId.slice(-6)}</span>
                          <span className="created-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">{customerName}</div>
                          <div className="customer-phone">{order.customer?.phone || ''}</div>
                        </div>
                      </td>
                      <td>
                        <div className="garment-info">
                          <div style={{ marginBottom: '4px' }}>
                            <span className="garment-type">{garmentType || 'Custom Order'}</span>
                          </div>
                          {order.fabric?.source === 'shop' && order.fabric?.name && (
                            <span 
                              className="fabric-badge"
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                backgroundColor: '#E0E7FF',
                                color: '#4F46E5',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '500',
                                marginTop: '4px'
                              }}
                            >
                              🧵 {order.fabric.name}
                            </span>
                          )}
                          {order.fabric?.source === 'customer' && (
                            <span 
                              className="fabric-badge"
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                backgroundColor: '#FEF3C7',
                                color: '#D97706',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '500',
                                marginTop: '4px'
                              }}
                            >
                              👔 Customer Fabric
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="status-container">
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="assigned-info">
                          {assignedName ? (
                            <div className="assigned-staff">
                              <FaUserTie className="staff-icon" />
                              <span>{assignedName}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowAssignModal(true);
                              }}
                              style={{
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
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
                          <span>{deliveryDate ? new Date(deliveryDate).toLocaleDateString() : 'Not set'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="amount-info">
                          <span className="amount">{formatCurrency(order.totalAmount || 0)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => window.location.href = `/admin/orders/${orderId}`}
                            className="btn-icon view"
                            title="View Details"
                            style={{ 
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '8px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FaEye style={{ fontSize: '16px', color: '#4F46E5' }} />
                          </button>
                          <button 
                            onClick={() => window.location.href = `/admin/orders/${orderId}/edit`}
                            className="btn-icon edit"
                            title="Edit Order"
                            style={{ 
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '8px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FaEdit style={{ fontSize: '16px', color: '#059669' }} />
                          </button>
                          <button 
                            onClick={() => handleDelete(orderId)}
                            className="btn-icon delete"
                            title="Delete Order"
                            style={{ 
                              background: '#EF4444',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}
                          >
                            <FaTrash style={{ fontSize: '14px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Assignment Modal */}
        {showAssignModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowAssignModal(false)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>Assign Tailor to Order</h2>
                <button 
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Order ID:</strong> #{selectedOrder?._id?.toString().slice(-6)}
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Customer:</strong> {selectedOrder?.customer?.name || 'N/A'}
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Amount:</strong> ₹{(selectedOrder?.totalAmount || 0).toLocaleString()}
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Select Tailor:
                </label>
                <select
                  value={selectedTailorId}
                  onChange={(e) => setSelectedTailorId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Select a Tailor --</option>
                  {tailors.map(tailor => (
                    <option key={tailor._id} value={tailor._id}>
                      {tailor.name} - {tailor.email}
                    </option>
                  ))}
                </select>
                {tailors.length === 0 && (
                  <p style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444' }}>
                    No tailors available. Please add tailors in Staff Management.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignOrder}
                  disabled={!selectedTailorId}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    background: selectedTailorId ? '#667eea' : '#d1d5db',
                    color: 'white',
                    cursor: selectedTailorId ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Assign Tailor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Actions */}
        <div className="bulk-actions">
          <h3>Quick Status Updates</h3>
          <div className="status-actions">
            <button 
              className="btn btn-outline"
              onClick={() => handleStatusUpdate(1, 'In Progress')}
            >
              Mark as In Progress
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleStatusUpdate(2, 'Ready')}
            >
              Mark as Ready
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleStatusUpdate(3, 'Delivered')}
            >
              Mark as Delivered
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <FaShoppingBag className="empty-icon" />
            <h3>No orders found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;