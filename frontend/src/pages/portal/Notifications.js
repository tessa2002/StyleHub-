import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { FaBell, FaCheck, FaTrash, FaEye, FaEyeSlash, FaCog, FaFilter } from 'react-icons/fa';
import './Notifications.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    email: true,
    sms: true,
    push: true,
    orderUpdates: true,
    appointmentReminders: true,
    paymentAlerts: true,
    promotional: false
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/portal/notifications');
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/portal/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/portal/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/portal/notifications/${notificationId}`);
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const updateSettings = async () => {
    try {
      await axios.put('/api/portal/notifications/settings', settings);
      alert('Notification settings updated successfully!');
      setShowSettings(false);
    } catch (err) {
      console.error('Failed to update settings:', err);
      alert('Failed to update settings. Please try again.');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'appointment': return '📅';
      case 'payment': return '💳';
      case 'reminder': return '⏰';
      case 'promotion': return '🎉';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return '#3b82f6';
      case 'appointment': return '#10b981';
      case 'payment': return '#f59e0b';
      case 'reminder': return '#8b5cf6';
      case 'promotion': return '#ec4899';
      case 'system': return '#6b7280';
      default: return '#667eea';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <DashboardLayout>
      <div className="notifications-page">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Stay updated with your orders, appointments, and account activity</p>
      </div>

      <div className="notifications-content">
        {/* Notification Summary */}
        <div className="notification-summary">
          <div className="summary-card">
            <div className="card-icon">
              <FaBell />
            </div>
            <div className="card-content">
              <h3>Total Notifications</h3>
              <p className="count">{notifications.length}</p>
              <span className="label">All time</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon unread">
              <FaBell />
            </div>
            <div className="card-content">
              <h3>Unread</h3>
              <p className="count">{unreadCount}</p>
              <span className="label">New notifications</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">
              <FaCog />
            </div>
            <div className="card-content">
              <h3>Settings</h3>
              <p className="count">Active</p>
              <span className="label">Notification preferences</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="notification-controls">
          <div className="filter-controls">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
                <option value="order">Order Updates</option>
                <option value="appointment">Appointments</option>
                <option value="payment">Payments</option>
                <option value="reminder">Reminders</option>
                <option value="promotion">Promotions</option>
              </select>
            </div>
          </div>
          
          <div className="action-controls">
            {unreadCount > 0 && (
              <button 
                className="action-btn secondary"
                onClick={markAllAsRead}
              >
                <FaCheck /> Mark All Read
              </button>
            )}
            <button 
              className="action-btn primary"
              onClick={() => setShowSettings(true)}
            >
              <FaCog /> Settings
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredNotifications.length > 0 ? (
            <div className="notifications-grid">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    <span 
                      className="icon"
                      style={{ color: getNotificationColor(notification.type) }}
                    >
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4>{notification.title}</h4>
                      <div className="notification-meta">
                        <span className="type">{notification.type}</span>
                        <span className="time">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="notification-message">{notification.message}</p>
                    
                    {notification.actionUrl && (
                      <a 
                        href={notification.actionUrl}
                        className="action-link"
                      >
                        View Details →
                      </a>
                    )}
                  </div>
                  
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button 
                        className="action-btn small"
                        onClick={() => markAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <FaEye />
                      </button>
                    )}
                    <button 
                      className="action-btn small delete"
                      onClick={() => deleteNotification(notification._id)}
                      title="Delete notification"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaBell className="empty-icon" />
              <p>No notifications found</p>
              <span>You're all caught up!</span>
            </div>
          )}
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Notification Settings</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowSettings(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="settings-form">
                <div className="settings-section">
                  <h3>Notification Channels</h3>
                  <div className="setting-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.checked})}
                      />
                      <span>Email Notifications</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.sms}
                        onChange={(e) => setSettings({...settings, sms: e.target.checked})}
                      />
                      <span>SMS Notifications</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.push}
                        onChange={(e) => setSettings({...settings, push: e.target.checked})}
                      />
                      <span>Push Notifications</span>
                    </label>
                  </div>
                </div>
                
                <div className="settings-section">
                  <h3>Notification Types</h3>
                  <div className="setting-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.orderUpdates}
                        onChange={(e) => setSettings({...settings, orderUpdates: e.target.checked})}
                      />
                      <span>Order Updates</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.appointmentReminders}
                        onChange={(e) => setSettings({...settings, appointmentReminders: e.target.checked})}
                      />
                      <span>Appointment Reminders</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.paymentAlerts}
                        onChange={(e) => setSettings({...settings, paymentAlerts: e.target.checked})}
                      />
                      <span>Payment Alerts</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.promotional}
                        onChange={(e) => setSettings({...settings, promotional: e.target.checked})}
                      />
                      <span>Promotional Offers</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="btn secondary"
                    onClick={() => setShowSettings(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn primary"
                    onClick={updateSettings}
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
