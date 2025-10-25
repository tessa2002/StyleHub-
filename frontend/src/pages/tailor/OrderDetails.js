import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaTshirt, FaRuler, FaStickyNote, FaArrowLeft, 
  FaPlay, FaCheckCircle, FaCalendarAlt, FaExclamationTriangle
} from 'react-icons/fa';
import TailorSidebar from '../../components/TailorSidebar';
import { useAuth } from '../../context/AuthContext';
import './OrderDetails.css';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Fetch from assigned orders (filtered for tailor)
      const response = await axios.get('/api/orders/assigned');
      const allOrders = response.data.orders || [];
      
      // Find the specific order
      const foundOrder = allOrders.find(o => o._id === orderId);
      
      if (!foundOrder) {
        alert('Order not found or not assigned to you');
        navigate('/dashboard/tailor/orders');
        return;
      }
      
      setOrder(foundOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to load order details');
      navigate('/dashboard/tailor/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async () => {
    if (!window.confirm('Start working on this order?')) return;
    
    try {
      setActionLoading(true);
      await axios.put(`/api/orders/${orderId}/start-work`);
      alert('✅ Work started! Order moved to In Progress');
      fetchOrderDetails(); // Refresh to show updated status
    } catch (error) {
      console.error('Error starting work:', error);
      alert('❌ Failed to start work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReady = async () => {
    if (!window.confirm('Mark this order as Ready?')) return;
    
    try {
      setActionLoading(true);
      await axios.put(`/api/orders/${orderId}/mark-ready`);
      alert('✅ Order marked as Ready!');
      navigate('/dashboard/tailor/ready');
    } catch (error) {
      console.error('Error marking ready:', error);
      alert('❌ Failed to mark as ready');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'status-pending',
      'Order Placed': 'status-pending',
      'Cutting': 'status-progress',
      'Stitching': 'status-progress',
      'Trial': 'status-progress',
      'Ready': 'status-ready',
      'Delivered': 'status-delivered'
    };
    return colors[status] || 'status-default';
  };

  const getDaysUntilDelivery = () => {
    if (!order) return 0;
    const deliveryDate = new Date(order.expectedDelivery || order.deliveryDate);
    const today = new Date();
    const diffTime = deliveryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="tailor-dashboard-container">
        <TailorSidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={logout}
        />
        <div className={`tailor-main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="order-details-page">
            <div className="loading">Loading order details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const daysLeft = getDaysUntilDelivery();
  const isUrgent = daysLeft <= 2;
  const isHighPriority = daysLeft > 2 && daysLeft <= 5;
  const isInProgress = ['Cutting', 'Stitching', 'Trial'].includes(order.status);
  const isPending = ['Pending', 'Order Placed'].includes(order.status);

  return (
    <div className="tailor-dashboard-container">
      <TailorSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={logout}
      />
      <div className={`tailor-main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="order-details-page">
          {/* Header */}
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate('/dashboard/tailor/orders')}>
              <FaArrowLeft /> Back to My Orders
            </button>
            <div className="header-content">
              <h1>Order Details</h1>
              <span className={`order-status ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Urgency Alert */}
          {(isUrgent || isHighPriority) && (
            <div className={`urgency-alert ${isUrgent ? 'urgent' : 'high'}`}>
              <FaExclamationTriangle />
              <span>
                {isUrgent ? '🔥 URGENT: ' : 'High Priority: '}
                Delivery in {daysLeft} day{daysLeft !== 1 ? 's' : ''}!
              </span>
            </div>
          )}

          {/* Order Info Cards */}
          <div className="order-info-grid">
            {/* Basic Info */}
            <div className="info-card">
              <div className="card-icon">
                <FaTshirt />
              </div>
              <div className="card-content">
                <h3>Garment Details</h3>
                <div className="detail-row">
                  <span className="label">Order ID:</span>
                  <span className="value">#{order.orderNumber || order._id.slice(-6)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Garment Type:</span>
                  <span className="value">{order.itemType}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Quantity:</span>
                  <span className="value">{order.items?.length || 1} item(s)</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="info-card">
              <div className="card-icon">
                <FaCalendarAlt />
              </div>
              <div className="card-content">
                <h3>Timeline</h3>
                <div className="detail-row">
                  <span className="label">Delivery Date:</span>
                  <span className="value">
                    {new Date(order.expectedDelivery || order.deliveryDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Days Left:</span>
                  <span className={`value ${daysLeft <= 2 ? 'urgent-text' : ''}`}>
                    {daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Priority:</span>
                  <span className={`value priority-${isUrgent ? 'urgent' : isHighPriority ? 'high' : 'normal'}`}>
                    {isUrgent ? 'Urgent' : isHighPriority ? 'High' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="details-section">
            <div className="section-header">
              <FaRuler />
              <h2>Measurements</h2>
            </div>
            <div className="measurements-grid">
              {(() => {
                // ✅ FIX: Check both field names (measurements and measurementSnapshot)
                const measurements = order.measurements || order.measurementSnapshot || {};
                const hasData = Object.keys(measurements).length > 0;
                
                return hasData ? (
                  Object.entries(measurements).map(([key, value]) => (
                    <div key={key} className="measurement-item">
                      <span className="measurement-label">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="measurement-value">{value}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No measurements provided</p>
                );
              })()}
            </div>
          </div>

          {/* Design Notes */}
          {(order.designNotes || order.specialInstructions) && (
            <div className="details-section">
              <div className="section-header">
                <FaStickyNote />
                <h2>Design Notes & Instructions</h2>
              </div>
              <div className="notes-content">
                {order.designNotes && (
                  <div className="note-block">
                    <h4>Design Notes:</h4>
                    <p>{order.designNotes}</p>
                  </div>
                )}
                {order.specialInstructions && (
                  <div className="note-block">
                    <h4>Special Instructions:</h4>
                    <p>{order.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items List */}
          {order.items && order.items.length > 0 && (
            <div className="details-section">
              <div className="section-header">
                <FaTshirt />
                <h2>Items to Make</h2>
              </div>
              <div className="items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="item-card">
                    <div className="item-number">{index + 1}</div>
                    <div className="item-details">
                      <h4>{item.name || item.type || 'Custom Item'}</h4>
                      {item.fabric && <p><strong>Fabric:</strong> {item.fabric}</p>}
                      {item.color && <p><strong>Color:</strong> {item.color}</p>}
                      {item.quantity && <p><strong>Quantity:</strong> {item.quantity}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            {isPending && (
              <button 
                className="btn-primary btn-large"
                onClick={handleStartWork}
                disabled={actionLoading}
              >
                <FaPlay /> {actionLoading ? 'Starting...' : 'Start Work'}
              </button>
            )}
            
            {isInProgress && (
              <button 
                className="btn-success btn-large"
                onClick={handleMarkReady}
                disabled={actionLoading}
              >
                <FaCheckCircle /> {actionLoading ? 'Updating...' : 'Mark as Ready'}
              </button>
            )}

            <button 
              className="btn-secondary btn-large"
              onClick={() => navigate('/dashboard/tailor/orders')}
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

