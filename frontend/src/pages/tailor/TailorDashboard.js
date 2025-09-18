import React, { useState, useEffect } from 'react';
import TailorDashboardLayout from '../../components/TailorDashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaMoneyBillWave,
  FaUsers,
  FaBoxes,
  FaExclamationTriangle,
  FaChartLine,
  FaCalendarAlt,
  FaEye,
  FaEdit,
  FaPlus
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TailorDashboard.css';

const TailorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    lowStockItems: 0,
    pendingPayments: 0,
    todayOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [quickStats, setQuickStats] = useState({
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard statistics
      const [ordersRes, customersRes, paymentsRes] = await Promise.all([
        axios.get('/api/tailor/orders/stats').catch(() => ({ data: {} })),
        axios.get('/api/tailor/customers/stats').catch(() => ({ data: {} })),
        axios.get('/api/tailor/payments/stats').catch(() => ({ data: {} }))
      ]);

      // Load recent data
      const [recentOrdersRes, recentCustomersRes, notificationsRes] = await Promise.all([
        axios.get('/api/tailor/orders/recent').catch(() => ({ data: [] })),
        axios.get('/api/tailor/customers/recent').catch(() => ({ data: [] })),
        axios.get('/api/tailor/notifications').catch(() => ({ data: [] }))
      ]);

      // Set stats from real data only
      setStats({
        totalOrders: ordersRes.data.totalOrders || 0,
        pendingOrders: ordersRes.data.pendingOrders || 0,
        completedOrders: ordersRes.data.completedOrders || 0,
        totalRevenue: ordersRes.data.totalRevenue || 0,
        totalCustomers: customersRes.data.totalCustomers || 0,
        lowStockItems: ordersRes.data.lowStockItems || 0,
        pendingPayments: paymentsRes.data.pendingPayments || 0,
        todayOrders: ordersRes.data.todayOrders || 0
      });

      setQuickStats({
        todayRevenue: ordersRes.data.todayRevenue || 0,
        weeklyRevenue: ordersRes.data.weeklyRevenue || 0,
        monthlyRevenue: ordersRes.data.monthlyRevenue || 0
      });

      // Set recent data from API only
      setRecentOrders(recentOrdersRes.data || []);
      setRecentCustomers(recentCustomersRes.data || []);
      setNotifications(notificationsRes.data || []);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#10b981';
      case 'in progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <TailorDashboardLayout title="Dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </TailorDashboardLayout>
    );
  }

  return (
    <TailorDashboardLayout title="Dashboard Overview">
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-text">
            <h2>Welcome back, {user?.name || 'Tailor'}!</h2>
            <p>Here's what's happening in your shop today</p>
          </div>
          <div className="quick-actions">
            <button 
              className="action-btn primary"
              onClick={() => navigate('/tailor/orders/new')}
            >
              <FaPlus />
              New Order
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => navigate('/tailor/customers/new')}
            >
              <FaPlus />
              Add Customer
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card" onClick={() => navigate('/tailor/orders')}>
            <div className="stat-icon orders">
              <FaClipboardList />
            </div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <div className="stat-number">{stats.totalOrders}</div>
              <p className="stat-change">+{stats.todayOrders} today</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/tailor/orders/pending')}>
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>Pending Orders</h3>
              <div className="stat-number">{stats.pendingOrders}</div>
              <p className="stat-change">Need attention</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/tailor/orders/completed')}>
            <div className="stat-icon completed">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <h3>Completed Orders</h3>
              <div className="stat-number">{stats.completedOrders}</div>
              <p className="stat-change">This month</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/tailor/payments')}>
            <div className="stat-icon revenue">
              <FaMoneyBillWave />
            </div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <div className="stat-number">{formatCurrency(stats.totalRevenue)}</div>
              <p className="stat-change">+{formatCurrency(quickStats.todayRevenue)} today</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/tailor/customers')}>
            <div className="stat-icon customers">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>Total Customers</h3>
              <div className="stat-number">{stats.totalCustomers}</div>
              <p className="stat-change">Active clients</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/tailor/inventory/fabrics')}>
            <div className="stat-icon inventory">
              <FaBoxes />
            </div>
            <div className="stat-content">
              <h3>Low Stock Items</h3>
              <div className="stat-number">{stats.lowStockItems}</div>
              <p className="stat-change">Need restock</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/tailor/payments/pending')}>
            <div className="stat-icon payments">
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <h3>Pending Payments</h3>
              <div className="stat-number">{stats.pendingPayments}</div>
              <p className="stat-change">Follow up needed</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/tailor/reports/sales')}>
            <div className="stat-icon reports">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3>Monthly Revenue</h3>
              <div className="stat-number">{formatCurrency(quickStats.monthlyRevenue)}</div>
              <p className="stat-change">This month</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-grid">
          {/* Recent Orders */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <FaClipboardList />
                Recent Orders
              </h3>
              <button 
                className="btn-link"
                onClick={() => navigate('/tailor/orders')}
              >
                View All
              </button>
            </div>
            <div className="card-content">
              {recentOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p><strong>No recent orders</strong></p>
                  <p>Orders will appear here once you start creating them.</p>
                </div>
              ) : (
                recentOrders.map(order => (
                <div key={order._id} className="order-item">
                  <div className="order-info">
                    <h4>{order.orderNumber}</h4>
                    <p>{order.customerName}</p>
                    <span className="service-type">{order.serviceType}</span>
                  </div>
                  <div className="order-details">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                    <p className="delivery-date">
                      <FaCalendarAlt />
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </p>
                    <p className="amount">{formatCurrency(order.amount)}</p>
                  </div>
                  <div className="order-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => navigate(`/tailor/orders/${order._id}`)}
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => navigate(`/tailor/orders/${order._id}/edit`)}
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>
              )))}
            </div>
          </div>

          {/* Recent Customers */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <FaUsers />
                Recent Customers
              </h3>
              <button 
                className="btn-link"
                onClick={() => navigate('/tailor/customers')}
              >
                View All
              </button>
            </div>
            <div className="card-content">
              {recentCustomers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <p><strong>No recent customers</strong></p>
                  <p>Customer data will appear here once you add customers.</p>
                </div>
              ) : (
                recentCustomers.map(customer => (
                <div key={customer._id} className="customer-item">
                  <div className="customer-avatar">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="customer-info">
                    <h4>{customer.name}</h4>
                    <p>{customer.email}</p>
                    <span className="phone">{customer.phone}</span>
                  </div>
                  <div className="customer-stats">
                    <p className="orders-count">{customer.totalOrders} orders</p>
                    <p className="last-order">Last: {new Date(customer.lastOrder).toLocaleDateString()}</p>
                  </div>
                </div>
              )))}
            </div>
          </div>

          {/* Notifications */}
          <div className="dashboard-card notifications-card">
            <div className="card-header">
              <h3>
                <FaExclamationTriangle />
                Notifications
              </h3>
              <button 
                className="btn-link"
                onClick={() => navigate('/tailor/notifications')}
              >
                View All
              </button>
            </div>
            <div className="card-content">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔔</div>
                  <p><strong>No notifications</strong></p>
                  <p>You're all caught up! Notifications will appear here when there are updates.</p>
                </div>
              ) : (
                notifications.map(notification => (
                <div key={notification._id} className="notification-item">
                  <div 
                    className="notification-indicator"
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  ></div>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      </div>
    </TailorDashboardLayout>
  );
};

export default TailorDashboard;
