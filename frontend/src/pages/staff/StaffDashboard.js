import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaBell, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaComments,
  FaChartLine,
  FaQuestionCircle,
  FaSignOutAlt
} from 'react-icons/fa';
import axios from 'axios';
import './StaffDashboard.css';

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    upcomingAppointments: 0,
    pendingTasks: 0,
    completedJobs: 0
  });
  const [tasks, setTasks] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setError('User authentication required');
        return;
      }

      // Since staff APIs might not be available yet, let's use fallback data for now
      console.log('Loading staff dashboard data for user:', user.id);
      
      // Try to fetch real data, but fall back gracefully
      let ordersRes, appointmentsRes, notificationsRes;
      
      try {
        ordersRes = await axios.get(`/api/staff/orders?staffId=${user.id}`);
        console.log('Orders loaded:', ordersRes.data.length);
      } catch (err) {
        console.warn('Orders API not available, using empty data');
        ordersRes = { data: [] };
      }
      
      try {
        appointmentsRes = await axios.get(`/api/staff/appointments?staffId=${user.id}`);
        console.log('Appointments loaded:', appointmentsRes.data.length);
      } catch (err) {
        console.warn('Appointments API not available, using empty data');
        appointmentsRes = { data: [] };
      }
      
      try {
        notificationsRes = await axios.get(`/api/staff/notifications?staffId=${user.id}`);
        console.log('Notifications loaded:', notificationsRes.data.length);
      } catch (err) {
        console.warn('Notifications API not available, using empty data');
        notificationsRes = { data: [] };
      }

      const assignedOrders = ordersRes.data || [];
      const assignedAppointments = appointmentsRes.data || [];
      const staffNotifications = notificationsRes.data || [];

      // Filter appointments for today and upcoming
      const today = new Date();
      const todayAppointments = assignedAppointments.filter(apt => {
        const aptDate = new Date(apt.scheduledAt || apt.date);
        return aptDate.toDateString() === today.toDateString();
      });

      const upcomingAppointments = assignedAppointments.filter(apt => {
        const aptDate = new Date(apt.scheduledAt || apt.date);
        const weekFromNow = new Date();
        weekFromNow.setDate(today.getDate() + 7);
        return aptDate > today && aptDate <= weekFromNow;
      });

      // Calculate real stats from assigned data
      const realStats = {
        totalOrders: assignedOrders.length,
        upcomingAppointments: upcomingAppointments.length,
        pendingTasks: assignedOrders.filter(order => 
          order.status === 'Pending' || order.status === 'Assigned' || order.status === 'In Progress'
        ).length,
        completedJobs: assignedOrders.filter(order => 
          order.status === 'Completed' || order.status === 'Delivered'
        ).length
      };

      // Process tasks from orders with better filtering
      const orderTasks = assignedOrders
        .filter(order => order.status !== 'Completed' && order.status !== 'Delivered')
        .map(order => ({
          id: order._id,
          title: `${order.serviceType || order.type || 'Order'} for ${order.customerName || 'Customer'}`,
          priority: order.priority || 'Medium',
          dueDate: order.deliveryDate || order.dueDate,
          status: order.status,
          customer: order.customerName || 'Unknown Customer',
          orderId: order.orderNumber || order._id
        }));

      setStats(realStats);
      setTasks(orderTasks);
      setAppointments(todayAppointments); // Show today's appointments in schedule
      setNotifications(staffNotifications);
      setRecentOrders(assignedOrders.slice(0, 5));
      setDataLoaded(true);
      
      console.log('Dashboard data loaded successfully');
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
      
      // Set empty data for clean display
      setStats({
        totalOrders: 0,
        upcomingAppointments: 0,
        pendingTasks: 0,
        completedJobs: 0
      });
      setTasks([]);
      setAppointments([]);
      setNotifications([]);
      setRecentOrders([]);
      setDataLoaded(true); // Mark as loaded even with empty data
      
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Update order status in backend
      await axios.put(`/api/orders/${taskId}/status`, { 
        status: newStatus,
        updatedBy: user.id
      });
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      // Refresh stats after status update
      loadDashboardData();
      
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      // Mark notification as read in backend
      await axios.put(`/api/staff/notifications/${notificationId}/read`, {
        staffId: user.id
      });
      
      // Remove from local state
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Still remove from UI even if API call fails
      setNotifications(notifications.filter(n => n.id !== notificationId));
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#dc2626';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#3b82f6';
      case 'Pending': return '#f59e0b';
      case 'Quality Check': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="staff-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome back, {user?.name || 'Staff Member'}!</h1>
            <p>Here's what's happening with your work today</p>
            {error && (
              <div className="error-banner">
                <span>⚠️ {error}</span>
                <button onClick={loadDashboardData} className="retry-btn">
                  Retry
                </button>
              </div>
            )}
          </div>
          <div className="header-actions">
            <div className="notification-bell" onClick={() => navigate('/notifications')}>
              <FaBell />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </div>
            <div className="profile-menu" onClick={() => navigate('/profile')}>
              <div className="avatar">
                {(user?.name || 'S').charAt(0).toUpperCase()}
              </div>
              <span>{user?.name || 'Staff'}</span>
            </div>
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card" onClick={() => navigate('/staff/orders')}>
            <div className="stat-icon orders">
              <FaClipboardList />
            </div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <div className="stat-number">{stats.totalOrders}</div>
              <p className="stat-label">Assigned to you</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/staff/appointments')}>
            <div className="stat-icon appointments">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>Upcoming Appointments</h3>
              <div className="stat-number">{stats.upcomingAppointments}</div>
              <p className="stat-label">This week</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/staff/tasks')}>
            <div className="stat-icon tasks">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>Pending Tasks</h3>
              <div className="stat-number">{stats.pendingTasks}</div>
              <p className="stat-label">Need attention</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/staff/completed')}>
            <div className="stat-icon completed">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <h3>Completed Jobs</h3>
              <div className="stat-number">{stats.completedJobs}</div>
              <p className="stat-label">This month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="main-content">
        {/* Tasks & Notifications */}
        <div className="content-left">
          {/* Tasks Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>
                <FaClipboardList />
                My Tasks
              </h2>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/staff/tasks')}
              >
                View All
              </button>
            </div>
            <div className="tasks-list">
              {tasks.slice(0, 3).map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-header">
                    <h4>{task.title}</h4>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="task-details">
                    <p><strong>Customer:</strong> {task.customer}</p>
                    <p><strong>Due:</strong> {task.dueDate ? `${formatDate(task.dueDate)} at ${formatTime(task.dueDate)}` : 'No deadline set'}</p>
                  </div>
                  <div className="task-actions">
                    <select 
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
              {dataLoaded && tasks.length === 0 && (
                <div className="empty-state positive">
                  <div className="empty-icon">✅</div>
                  <p><strong>All caught up!</strong></p>
                  <p>No pending tasks assigned to you right now.</p>
                </div>
              )}
              {!dataLoaded && loading && (
                <div className="loading-state">
                  <p>Loading your tasks...</p>
                </div>
              )}
            </div>
          </section>

          {/* Notifications Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>
                <FaBell />
                Notifications
              </h2>
              <button 
                className="btn-secondary"
                onClick={() => setNotifications([])}
              >
                Clear All
              </button>
            </div>
            <div className="notifications-list">
              {notifications.slice(0, 3).map(notification => (
                <div key={notification._id || notification.id} className={`notification-item ${notification.type || 'info'}`}>
                  <div className="notification-content">
                    <p>{notification.message || notification.content}</p>
                    <span className="notification-time">
                      {notification.createdAt ? 
                        new Date(notification.createdAt).toLocaleString() : 
                        notification.time
                      }
                    </span>
                  </div>
                  <button 
                    className="notification-close"
                    onClick={() => markNotificationRead(notification._id || notification.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {dataLoaded && notifications.length === 0 && (
                <div className="empty-state positive">
                  <div className="empty-icon">🔔</div>
                  <p><strong>You're all up to date!</strong></p>
                  <p>No new notifications at the moment.</p>
                </div>
              )}
              {!dataLoaded && loading && (
                <div className="loading-state">
                  <p>Loading notifications...</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Schedule & Orders */}
        <div className="content-right">
          {/* Schedule Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>
                <FaCalendarAlt />
                Today's Schedule
              </h2>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/staff/schedule')}
              >
                View Calendar
              </button>
            </div>
            <div className="schedule-list">
              {appointments.slice(0, 3).map(appointment => (
                <div key={appointment._id || appointment.id} className="appointment-item">
                  <div className="appointment-time">
                    {formatTime(appointment.scheduledAt || appointment.date)}
                  </div>
                  <div className="appointment-details">
                    <h4>{appointment.service || appointment.serviceType}</h4>
                    <p>{appointment.customerName || appointment.customer}</p>
                    <span className={`status-badge ${(appointment.status || 'pending').toLowerCase()}`}>
                      {appointment.status || 'Pending'}
                    </span>
                  </div>
                  <div className="appointment-actions">
                    <button 
                      className="btn-small"
                      onClick={() => navigate(`/staff/appointments/${appointment._id || appointment.id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
              {dataLoaded && appointments.length === 0 && (
                <div className="empty-state positive">
                  <div className="empty-icon">📅</div>
                  <p><strong>Free schedule today!</strong></p>
                  <p>No appointments scheduled for today — you're all caught up!</p>
                </div>
              )}
              {!dataLoaded && loading && (
                <div className="loading-state">
                  <p>Loading today's schedule...</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Orders */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>
                <FaClipboardList />
                Recent Orders
              </h2>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/staff/orders')}
              >
                View All Orders
              </button>
            </div>
            <div className="orders-list">
              {recentOrders.map(order => (
                <div key={order._id} className="order-item">
                  <div className="order-header">
                    <h4>{order.orderNumber || `#${order._id.slice(-6)}`}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <p><strong>Customer:</strong> {order.customerName}</p>
                    <p><strong>Type:</strong> {order.serviceType || order.type || 'Custom Order'}</p>
                    <p><strong>Deadline:</strong> {order.deliveryDate ? formatDate(order.deliveryDate) : 'Not set'}</p>
                  </div>
                  <div className="order-actions">
                    <button 
                      className="btn-small"
                      onClick={() => navigate(`/staff/orders/${order._id}`)}
                    >
                      View
                    </button>
                    <select 
                      value={order.status}
                      onChange={(e) => updateTaskStatus(order._id, e.target.value)}
                      className="status-select-small"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Ready for Delivery">Ready</option>
                    </select>
                  </div>
                </div>
              ))}
              {dataLoaded && recentOrders.length === 0 && (
                <div className="empty-state positive">
                  <div className="empty-icon">📋</div>
                  <p><strong>Ready for new assignments!</strong></p>
                  <p>No orders assigned to you yet. Check back soon for new work.</p>
                </div>
              )}
              {!dataLoaded && loading && (
                <div className="loading-state">
                  <p>Loading your orders...</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Quick Actions & Footer */}
      <footer className="dashboard-footer">
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button 
              className="action-btn"
              onClick={() => navigate('/staff/orders/new')}
            >
              <FaClipboardList />
              New Order
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/staff/appointments/new')}
            >
              <FaCalendarAlt />
              Schedule Appointment
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/staff/messages')}
            >
              <FaComments />
              Messages
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/staff/performance')}
            >
              <FaChartLine />
              Performance
            </button>
          </div>
        </div>
        
        <div className="footer-links">
          <div className="links-section">
            <h4>Profile & Settings</h4>
            <a href="/staff/profile">My Profile</a>
            <a href="/staff/settings">Settings</a>
            <a href="/staff/preferences">Preferences</a>
          </div>
          <div className="links-section">
            <h4>Help & Support</h4>
            <a href="/help">Help Center</a>
            <a href="/support">Contact Support</a>
            <a href="/feedback">Send Feedback</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
