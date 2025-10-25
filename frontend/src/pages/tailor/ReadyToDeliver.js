import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRedo, FaCheckCircle, FaTruck } from 'react-icons/fa';
import './MyOrders.css';

export default function ReadyToDeliver() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadyOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchReadyOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/assigned');
      const allOrders = response.data.orders || [];
      
      // Filter only Ready and Delivered orders
      const readyOrders = allOrders.filter(order => 
        ['Ready', 'Delivered'].includes(order.status)
      );
      
      setOrders(readyOrders);
      console.log(`✅ Loaded ${readyOrders.length} ready/delivered orders`);
    } catch (error) {
      console.error('Error fetching ready orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Ready': 'badge-success',
      'Delivered': 'badge-info'
    };
    return <span className={`status-badge ${statusColors[status] || 'badge-secondary'}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="page-header">
          <h1>Ready to Deliver</h1>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="page-header">
        <div className="header-left">
          <h1>✅ Ready to Deliver</h1>
          <p className="subtitle">Completed orders ready for delivery ({orders.length})</p>
        </div>
        <button 
          className="btn-refresh" 
          onClick={fetchReadyOrders} 
          disabled={loading}
        >
          <FaRedo className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders ready</h3>
          <p>Complete your in-progress orders to see them here</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Dress Type</th>
                <th>Completed On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="order-id">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div className="dress-type">
                      {order.itemType || 'Custom Garment'}
                    </div>
                  </td>
                  <td>
                    {order.completedAt 
                      ? new Date(order.completedAt).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        }) 
                      : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${order.status === 'Ready' ? 'badge-success' : 'badge-info'}`}>
                      {order.status === 'Ready' ? <><FaCheckCircle /> Ready</> : <><FaTruck /> Delivered</>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="summary-box">
            <h3>📊 Summary</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-label">Total Ready:</span>
                <span className="stat-value">{orders.filter(o => o.status === 'Ready').length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Delivered:</span>
                <span className="stat-value">{orders.filter(o => o.status === 'Delivered').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

