import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();  // user is properly used

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalCustomers: 24,
        totalOrders: 48,
        pendingOrders: 12,
        totalRevenue: 28400
      });
    }, 1000);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Style Hub Dashboard</h1>
          <p>Welcome back, {user?.name || 'User'}!</p>  {/* Safe fallback */}
        </div>
        <div className="header-right">
          <span className="user-role">Role: {user?.role || 'N/A'}</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Customers</h3>
            <p className="stat-number">{stats.totalCustomers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-number">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn">
            <span className="btn-icon">➕</span>
            Add New Customer
          </button>
          <button className="action-btn">
            <span className="btn-icon">📋</span>
            Create New Order
          </button>
          <button className="action-btn">
            <span className="btn-icon">👔</span>
            View Measurements
          </button>
          <button className="action-btn">
            <span className="btn-icon">💸</span>
            Generate Invoice
          </button>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">✅</span>
            <div className="activity-content">
              <p>Order #ORD-1023 completed</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">👥</span>
            <div className="activity-content">
              <p>New customer registered: Rajesh Kumar</p>
              <span className="activity-time">4 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📦</span>
            <div className="activity-content">
              <p>New order received from Priya Sharma</p>
              <span className="activity-time">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
