import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaRedo, FaEye, FaCheck } from 'react-icons/fa';
import './MyOrders.css';

export default function InProgress() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInProgressOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchInProgressOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchInProgressOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/assigned');
      const allOrders = response.data.orders || [];
      
      // Filter only in-progress orders (Cutting, Stitching, Trial)
      const inProgressOrders = allOrders.filter(order => 
        ['Cutting', 'Stitching', 'Trial'].includes(order.status)
      );
      
      setOrders(inProgressOrders);
      console.log(`✅ Loaded ${inProgressOrders.length} in-progress orders`);
    } catch (error) {
      console.error('Error fetching in-progress orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async (orderId) => {
    if (!window.confirm('Mark this order as Ready for delivery? Admin, staff, and customer will be notified.')) return;
    
    try {
      setActionLoading(orderId);
      console.log(`✅ Marking order as ready: ${orderId}`);
      
      await axios.put(`/api/orders/${orderId}/mark-ready`, {
        completedAt: new Date()
      });
      
      alert('✅ Order marked as Ready! Notifications sent to admin, staff, and customer.');
      
      // Refresh list - order will disappear from In Progress
      await fetchInProgressOrders();
    } catch (error) {
      console.error('Error marking order as ready:', error);
      alert('❌ Failed to mark order as ready: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Cutting': 'badge-warning',
      'Stitching': 'badge-info',
      'Trial': 'badge-primary'
    };
    return <span className={`status-badge ${statusColors[status] || 'badge-secondary'}`}>{status}</span>;
  };

  const getUrgency = (deliveryDate) => {
    const daysLeft = Math.ceil((new Date(deliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return <span className="urgency urgent">⚠️ Overdue</span>;
    if (daysLeft <= 2) return <span className="urgency urgent">🔥 Urgent</span>;
    if (daysLeft <= 5) return <span className="urgency high">High Priority</span>;
    return <span className="urgency normal">Normal</span>;
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="page-header">
          <h1>In Progress</h1>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="page-header">
        <div className="header-left">
          <h1>🛠 In Progress Orders</h1>
          <p className="subtitle">Orders you're currently working on ({orders.length})</p>
        </div>
        <button 
          className="btn-refresh" 
          onClick={fetchInProgressOrders} 
          disabled={loading}
        >
          <FaRedo className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No orders in progress</h3>
          <p>Start working on an order from "My Orders"</p>
          <button className="btn-primary" onClick={() => navigate('/dashboard/tailor/orders')}>
            View All Orders
          </button>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Dress Type</th>
                <th>Delivery Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="order-id">#{order.orderNumber || order._id.slice(-6)}</td>
                  <td>{order.itemType}</td>
                  <td>{new Date(order.expectedDelivery || order.deliveryDate).toLocaleDateString()}</td>
                  <td>{getUrgency(order.expectedDelivery || order.deliveryDate)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn-info btn-sm"
                        onClick={() => navigate(`/dashboard/tailor/order/${order._id}`)}
                        title="View order details"
                      >
                        <FaEye /> View
                      </button>
                      <button 
                        className="btn-success btn-sm"
                        onClick={() => handleMarkReady(order._id)}
                        disabled={actionLoading === order._id}
                        title="Mark as Ready for delivery"
                      >
                        <FaCheck /> {actionLoading === order._id ? 'Updating...' : 'Mark Ready'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

