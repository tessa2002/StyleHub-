import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import TailorDashboardLayout from '../../../components/TailorDashboardLayout';
import {
  FaArrowLeft, FaArrowRight, FaPlay, FaCheckCircle,
  FaScissors, FaTshirt, FaUser, FaCalendarAlt, FaRuler,
  FaClock, FaChevronRight
} from 'react-icons/fa';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/assigned');
      const allOrders = response.data.orders || response.data || [];
      const foundOrder = allOrders.find(o => o._id === id);
      
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        alert('Order not found or not assigned to you');
        navigate('/dashboard/tailor/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async () => {
    if (!window.confirm('Start working on this order?')) return;
    
    try {
      setProcessing(true);
      const response = await axios.put(`/api/orders/${id}/start-work`);
      
      if (response.data.success) {
        alert('✅ Work started! Order moved to Cutting stage.');
        fetchOrderDetails(); // Refresh
      }
    } catch (error) {
      console.error('Error starting work:', error);
      alert('Failed to start work: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const handleNextStage = async () => {
    const stageNames = {
      'Pending': 'Cutting',
      'Order Placed': 'Cutting',
      'Cutting': 'Stitching',
      'Stitching': 'Ready'
    };
    
    const nextStage = stageNames[order.status];
    if (!window.confirm(`Move order to ${nextStage} stage?`)) return;
    
    try {
      setProcessing(true);
      const response = await axios.put(`/api/orders/${id}/next-stage`);
      
      if (response.data.success) {
        alert(`✅ Order moved to ${response.data.currentStatus}!`);
        fetchOrderDetails(); // Refresh
      }
    } catch (error) {
      console.error('Error advancing stage:', error);
      alert('Failed to advance: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f59e0b',
      'Order Placed': '#6b7280',
      'Cutting': '#3b82f6',
      'Stitching': '#8b5cf6',
      'Trial': '#06b6d4',
      'Ready': '#10b981',
      'Delivered': '#059669'
    };
    return colors[status] || '#6b7280';
  };

  const getNextButtonText = (status) => {
    const buttons = {
      'Pending': 'Start Work',
      'Order Placed': 'Start Work',
      'Cutting': 'Next → Stitching',
      'Stitching': 'Mark as Ready',
      'Trial': 'Mark as Ready'
    };
    return buttons[status] || 'Next';
  };

  const canAdvance = (status) => {
    return ['Pending', 'Order Placed', 'Cutting', 'Stitching', 'Trial'].includes(status);
  };

  if (loading) {
    return (
      <TailorDashboardLayout>
        <div className="order-details-loading">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </TailorDashboardLayout>
    );
  }

  if (!order) {
    return (
      <TailorDashboardLayout>
        <div className="order-not-found">
          <p>Order not found</p>
          <button onClick={() => navigate('/dashboard/tailor/orders')}>
            Back to Orders
          </button>
        </div>
      </TailorDashboardLayout>
    );
  }

  return (
    <TailorDashboardLayout>
      <div className="order-details-page">
        {/* Header */}
        <div className="page-header">
          <button 
            className="btn-back"
            onClick={() => navigate('/dashboard/tailor/orders')}
          >
            <FaArrowLeft /> Back to Orders
          </button>
          <div className="header-info">
            <h1>Order #{String(order._id).slice(-6).toUpperCase()}</h1>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(order.status) }}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Workflow Progress */}
        <div className="workflow-progress">
          <div className="workflow-steps">
            <div className={`workflow-step ${['Pending', 'Order Placed', 'Cutting', 'Stitching', 'Ready', 'Delivered'].includes(order.status) ? 'active' : ''}`}>
              <div className="step-icon"><FaClock /></div>
              <div className="step-label">Pending</div>
            </div>
            <FaChevronRight className="workflow-arrow" />
            <div className={`workflow-step ${['Cutting', 'Stitching', 'Ready', 'Delivered'].includes(order.status) ? 'active' : ''}`}>
              <div className="step-icon"><FaScissors /></div>
              <div className="step-label">Cutting</div>
            </div>
            <FaChevronRight className="workflow-arrow" />
            <div className={`workflow-step ${['Stitching', 'Ready', 'Delivered'].includes(order.status) ? 'active' : ''}`}>
              <div className="step-icon"><FaTshirt /></div>
              <div className="step-label">Stitching</div>
            </div>
            <FaChevronRight className="workflow-arrow" />
            <div className={`workflow-step ${['Ready', 'Delivered'].includes(order.status) ? 'active' : ''}`}>
              <div className="step-icon"><FaCheckCircle /></div>
              <div className="step-label">Ready</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {canAdvance(order.status) && (
          <div className="action-section">
            {(order.status === 'Pending' || order.status === 'Order Placed') ? (
              <button
                className="btn btn-primary btn-large"
                onClick={handleStartWork}
                disabled={processing}
              >
                <FaPlay /> {processing ? 'Starting...' : 'Start Work on This Order'}
              </button>
            ) : (
              <button
                className="btn btn-primary btn-large"
                onClick={handleNextStage}
                disabled={processing}
              >
                <FaArrowRight /> {processing ? 'Processing...' : getNextButtonText(order.status)}
              </button>
            )}
          </div>
        )}

        {order.status === 'Ready' && (
          <div className="completion-message">
            <FaCheckCircle className="completion-icon" />
            <h2>Order Completed!</h2>
            <p>This order is ready for delivery to the customer.</p>
          </div>
        )}

        {/* Order Information */}
        <div className="order-info-grid">
          {/* Customer Info */}
          <div className="info-card">
            <h3><FaUser /> Customer Information</h3>
            <div className="info-content">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{order.customer?.name || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{order.customer?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="info-card">
            <h3><FaTshirt /> Order Details</h3>
            <div className="info-content">
              <div className="info-row">
                <span className="info-label">Item Type:</span>
                <span className="info-value">{order.itemType || 'Custom Garment'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span 
                  className="info-value" 
                  style={{ 
                    color: getStatusColor(order.status),
                    fontWeight: 'bold'
                  }}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="info-card">
            <h3><FaCalendarAlt /> Timeline</h3>
            <div className="info-content">
              <div className="info-row">
                <span className="info-label">Order Date:</span>
                <span className="info-value">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Expected Delivery:</span>
                <span className="info-value">
                  {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Measurements */}
          {order.measurements || order.measurementSnapshot ? (
            <div className="info-card full-width">
              <h3><FaRuler /> Measurements</h3>
              <div className="measurements-grid">
                {Object.entries(order.measurements || order.measurementSnapshot || {}).map(([key, value]) => (
                  <div key={key} className="measurement-item">
                    <span className="measurement-label">{key}:</span>
                    <span className="measurement-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Special Instructions */}
          {order.notes && (
            <div className="info-card full-width">
              <h3>Special Instructions</h3>
              <div className="info-content">
                <p>{order.notes}</p>
              </div>
            </div>
          )}

          {/* Reference Images from Customer */}
          {order.attachments && order.attachments.length > 0 && (
            <div className="info-card full-width">
              <h3>📸 Reference Images from Customer</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
                Customer provided these reference images for design inspiration and fitting guidance
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
                marginTop: '12px'
              }}>
                {order.attachments
                  .filter(att => att.category === 'Sketch' || att.mimeType?.startsWith('image/'))
                  .map((attachment, index) => (
                    <div 
                      key={index}
                      style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '2px solid #e5e7eb',
                        backgroundColor: '#f8f9fa',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      onClick={() => window.open(attachment.url, '_blank')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }}
                    >
                      <img 
                        src={attachment.url}
                        alt={attachment.filename || `Reference ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#64748b;">Image not available</div>';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                        padding: '24px 12px 8px',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        Reference {index + 1}
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(79, 70, 229, 0.9)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        🔍 Click to enlarge
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </TailorDashboardLayout>
  );
};

export default OrderDetails;

