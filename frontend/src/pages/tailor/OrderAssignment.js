import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TailorSidebar from '../../components/TailorSidebar';
import { 
  FaClipboardList, FaCheck, FaTimes, FaEye, FaExclamationCircle,
  FaUser, FaCalendarAlt, FaRuler, FaTshirt, FaClock, FaInfoCircle
} from 'react-icons/fa';
import './OrderAssignment.css';

const OrderAssignment = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [changeRequest, setChangeRequest] = useState('');
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching pending order assignments...');
      
      // Fetch orders assigned to this tailor with Pending status
      const response = await axios.get('/api/orders/assigned');
      const allOrders = response.data.orders || response.data || [];
      
      // Filter only pending assignments (not yet accepted)
      const pendingAssignments = allOrders.filter(order => 
        order.status === 'Pending' || 
        order.status === 'Order Placed' ||
        !order.acceptedByTailor
      );
      
      setAssignments(pendingAssignments);
      console.log(`✅ Found ${pendingAssignments.length} pending assignments`);
    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setActionLoading(true);
      console.log(`✅ Accepting order: ${orderId}`);
      
      await axios.put(`/api/orders/${orderId}/accept`, {
        acceptedByTailor: true,
        acceptedAt: new Date()
      });
      
      // Update local state
      setAssignments(assignments.filter(a => a._id !== orderId));
      
      alert('✅ Order accepted successfully! It now appears in your work queue.');
      
      // Refresh assignments
      fetchAssignments();
    } catch (error) {
      console.error('❌ Error accepting order:', error);
      alert('Failed to accept order: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChange = async (orderId) => {
    if (!changeRequest.trim()) {
      alert('Please enter details about the change you need');
      return;
    }

    try {
      setActionLoading(true);
      console.log(`📝 Requesting change for order: ${orderId}`);
      
      await axios.put(`/api/orders/${orderId}/request-change`, {
        changeRequest: changeRequest,
        requestedBy: user._id,
        requestedAt: new Date()
      });
      
      setShowChangeModal(false);
      setChangeRequest('');
      setSelectedOrder(null);
      
      // Update local state
      setAssignments(assignments.filter(a => a._id !== orderId));
      
      alert('✅ Change request submitted successfully! Admin will review your request.');
      
      // Refresh assignments
      fetchAssignments();
    } catch (error) {
      console.error('❌ Error requesting change:', error);
      alert('Failed to submit change request: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const openChangeModal = (order) => {
    setSelectedOrder(order);
    setShowChangeModal(true);
    setChangeRequest('');
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not Set';
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Not Set';
    }
  };

  if (loading) {
    return (
      <div className="tailor-layout">
        <TailorSidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={handleLogout}
        />
        <div className={`tailor-main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="tailor-dashboard">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading assignments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tailor-layout">
      <TailorSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />
      <div className={`tailor-main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="tailor-dashboard">
          {/* Header */}
          <div className="dashboard-header">
            <div className="header-content">
              <h1>📥 Order Assignments</h1>
              <p>Review and accept new orders assigned to you</p>
            </div>
            <div className="header-actions">
              {assignments.length > 0 && (
                <div className="alert-badge">
                  <FaClipboardList />
                  <span>{assignments.length} Pending</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Banner */}
          <div className="info-banner">
            <FaInfoCircle />
            <div>
              <strong>How it works:</strong> When a manager assigns an order to you, it appears here. 
              Review the details and either accept the order or request changes if needed.
            </div>
          </div>

          {/* Assignments List */}
          <div className="assignments-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Pending Assignments ({assignments.length})</h2>
              <button 
                className="btn btn-primary" 
                onClick={fetchAssignments}
                disabled={loading}
                style={{ fontSize: '0.875rem', padding: '8px 16px' }}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="empty-state">
                <FaClipboardList className="empty-icon" />
                <h3>No Pending Assignments</h3>
                <p>You have no pending order assignments. New assignments will appear here.</p>
              </div>
            ) : (
              <div className="assignments-grid">
                {assignments.map((order) => (
                  <div key={order._id} className="assignment-card">
                    {/* Card Header */}
                    <div className="card-header-section">
                      <div className="order-id-badge">
                        Order #{String(order._id).slice(-6).toUpperCase()}
                      </div>
                      <div className="status-badge status-pending">
                        📥 Pending Assignment
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body-section">
                      {/* Customer Info */}
                      <div className="info-row">
                        <FaUser className="info-icon" />
                        <div>
                          <div className="info-label">Customer</div>
                          <div className="info-value">{order.customer?.name || order.customerName || 'Unknown'}</div>
                        </div>
                      </div>

                      {/* Garment Type */}
                      <div className="info-row">
                        <FaTshirt className="info-icon" />
                        <div>
                          <div className="info-label">Garment Type</div>
                          <div className="info-value">{order.itemType || order.items?.[0]?.name || 'Custom'}</div>
                        </div>
                      </div>

                      {/* Expected Delivery */}
                      <div className="info-row">
                        <FaCalendarAlt className="info-icon" />
                        <div>
                          <div className="info-label">Expected Delivery</div>
                          <div className="info-value">{formatDate(order.expectedDelivery || order.deliveryDate)}</div>
                        </div>
                      </div>

                      {/* Order Amount */}
                      <div className="info-row">
                        <div className="info-label">Order Amount</div>
                        <div className="info-value amount">₹{(order.totalAmount || 0).toLocaleString()}</div>
                      </div>

                      {/* Assignment Notification */}
                      <div className="notification-box">
                        <FaExclamationCircle />
                        <span>New Order Assigned: #{String(order._id).slice(-6).toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="card-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => viewOrderDetails(order)}
                        disabled={actionLoading}
                      >
                        <FaEye /> View Details
                      </button>
                      <button
                        className="btn btn-warning"
                        onClick={() => openChangeModal(order)}
                        disabled={actionLoading}
                      >
                        <FaTimes /> Request Change
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={actionLoading}
                      >
                        <FaCheck /> Accept Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Details Modal */}
          {showDetailsModal && selectedOrder && (
            <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Order Details</h2>
                  <button onClick={() => setShowDetailsModal(false)} className="close-btn">×</button>
                </div>
                
                <div className="modal-body">
                  {/* Order Info */}
                  <div className="info-section">
                    <h3>Order Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Order ID:</label>
                        <span>#{String(selectedOrder._id).slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="info-item">
                        <label>Garment Type:</label>
                        <span>{selectedOrder.itemType || 'Custom'}</span>
                      </div>
                      <div className="info-item">
                        <label>Delivery Date:</label>
                        <span>{formatDate(selectedOrder.expectedDelivery || selectedOrder.deliveryDate)}</span>
                      </div>
                      <div className="info-item">
                        <label>Order Amount:</label>
                        <span style={{ fontWeight: '600', color: '#059669' }}>
                          ₹{(selectedOrder.totalAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="info-section">
                    <h3><FaUser /> Customer Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{selectedOrder.customer?.name || selectedOrder.customerName || 'Unknown'}</span>
                      </div>
                      <div className="info-item">
                        <label>Phone:</label>
                        <span>{selectedOrder.customer?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Measurements */}
                  {selectedOrder.measurements && Object.keys(selectedOrder.measurements).length > 0 && (
                    <div className="info-section">
                      <h3><FaRuler /> Measurements</h3>
                      <div className="measurements-grid">
                        {Object.entries(selectedOrder.measurements).map(([key, value]) => (
                          <div key={key} className="measurement-item">
                            <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                            <span>{value} inches</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fabric Details */}
                  {selectedOrder.fabric && (
                    <div className="info-section">
                      <h3><FaTshirt /> Fabric Details</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Source:</label>
                          <span>
                            {selectedOrder.fabric.source === 'shop' ? 
                              <span className="badge shop">🧵 Shop Fabric</span> : 
                              <span className="badge customer">👔 Customer Fabric</span>
                            }
                          </span>
                        </div>
                        {selectedOrder.fabric.name && (
                          <div className="info-item">
                            <label>Fabric:</label>
                            <span>{selectedOrder.fabric.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div className="info-section">
                      <h3>Special Notes</h3>
                      <p style={{ margin: 0, color: '#6B7280' }}>{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Change Request Modal */}
          {showChangeModal && selectedOrder && (
            <div className="modal-overlay" onClick={() => setShowChangeModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Request Change</h2>
                  <button onClick={() => setShowChangeModal(false)} className="close-btn">×</button>
                </div>
                
                <div className="modal-body">
                  <div className="info-section">
                    <h3>Order #{String(selectedOrder._id).slice(-6).toUpperCase()}</h3>
                    <p style={{ color: '#6B7280', marginBottom: '20px' }}>
                      Please describe what changes you need for this order. The admin will review your request and respond accordingly.
                    </p>
                    
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                      Change Request Details:
                    </label>
                    <textarea
                      value={changeRequest}
                      onChange={(e) => setChangeRequest(e.target.value)}
                      placeholder="Example: Need clarification on measurements, Fabric color doesn't match customer preference, Delivery deadline is too tight..."
                      rows="6"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                    
                    <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setShowChangeModal(false)}
                        className="btn btn-outline"
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRequestChange(selectedOrder._id)}
                        className="btn btn-primary"
                        disabled={actionLoading || !changeRequest.trim()}
                      >
                        {actionLoading ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderAssignment;

