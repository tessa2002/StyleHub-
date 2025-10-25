import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  FaBell, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
  FaUsers, FaBullhorn, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaEye, FaTimes, FaSave, FaUser, FaUserTie, FaUserCog
} from 'react-icons/fa';
import './Notifications.css';

const AdminNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [formData, setFormData] = useState({
    message: '',
    type: 'info',
    priority: 'medium',
    targetRoles: ['Staff'],
    targetUsers: [],
    actionUrl: ''
  });
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    targetRoles: ['Staff'],
    priority: 'medium',
    actionUrl: ''
  });
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingIds, setDeletingIds] = useState(new Set());

  useEffect(() => {
    fetchNotifications();
  }, [searchTerm, statusFilter, typeFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);

      console.log('=== FETCHING NOTIFICATIONS ===');
      console.log('Fetching notifications with params:', params.toString());
      console.log('Current user:', user);
      
      // Use admin endpoint to get all notifications
      const response = await axios.get(`/api/notifications/admin?${params}`);
      console.log('Admin notifications response:', response.data);
      console.log('Number of notifications found:', response.data.notifications?.length || 0);
      
      if (response.data.notifications && response.data.notifications.length > 0) {
        console.log('Sample notification:', response.data.notifications[0]);
      }
      
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Error details:', error.response?.data);
      
      // Fallback to regular endpoint if admin endpoint fails
      try {
        const fallbackParams = new URLSearchParams();
        if (searchTerm) fallbackParams.append('search', searchTerm);
        if (statusFilter) fallbackParams.append('status', statusFilter);
        if (typeFilter) fallbackParams.append('type', typeFilter);
        
        console.log('Trying fallback endpoint with params:', fallbackParams.toString());
        const response = await axios.get(`/api/notifications?${fallbackParams}`);
        console.log('Fallback notifications response:', response.data);
        setNotifications(response.data.notifications || []);
      } catch (fallbackError) {
        console.error('Error fetching notifications (fallback):', fallbackError);
        setNotifications([]);
      }
    } finally {
      setLoading(false);
      console.log('=== END FETCHING NOTIFICATIONS ===');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post('/api/notifications/broadcast', formData);
      setShowForm(false);
      setFormData({
        message: '',
        type: 'info',
        priority: 'medium',
        targetRoles: ['Staff'],
        targetUsers: [],
        actionUrl: ''
      });
      // Refresh notifications list immediately
      await fetchNotifications();
      setSuccessMessage('Notification sent successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post('/api/notifications/broadcast', broadcastData);
      setShowBroadcast(false);
      setBroadcastData({
        title: '',
        message: '',
        targetRoles: ['Staff'],
        priority: 'medium',
        actionUrl: ''
      });
      // Refresh notifications list immediately
      await fetchNotifications();
      setSuccessMessage('Broadcast sent successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      // Refresh notifications list immediately
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      // Add to deleting set to show loading state
      setDeletingIds(prev => new Set([...prev, notificationId]));
      
      try {
        console.log('=== FRONTEND DELETE DEBUG ===');
        console.log('Deleting notification ID:', notificationId);
        console.log('Current user:', user);
        console.log('Token exists:', !!localStorage.getItem('token'));
        
        // Get the token from localStorage or from the auth context
        const token = localStorage.getItem('token') || user?.token;
        
        if (!token) {
          setErrorMessage('No authentication token found. Please log in again.');
          setTimeout(() => setErrorMessage(''), 5000);
          setDeletingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(notificationId);
            return newSet;
          });
          return;
        }
        
        const response = await axios.delete(`/api/notifications/${notificationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Delete response:', response.data);
        
        // Show success message immediately
        setSuccessMessage('Notification deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Force immediate UI update by removing from state
        setNotifications(prev => {
          console.log('Current notifications before delete:', prev.map(n => ({ id: n._id, message: n.message })));
          const updated = prev.filter(notification => {
            const shouldKeep = notification._id !== notificationId;
            console.log(`Notification ${notification._id} ${shouldKeep ? 'kept' : 'removed'}`);
            return shouldKeep;
          });
          console.log('Notifications after delete:', updated.length);
          return updated;
        });
        
        // Force a re-render by updating loading state briefly
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
        }, 100);
        
        // Force another state update to ensure UI refreshes
        setTimeout(() => {
          setNotifications(prev => {
            const updated = prev.filter(notification => notification._id !== notificationId);
            console.log('Final notification count:', updated.length);
            return updated;
          });
        }, 200);
        
        // Remove from deleting set
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
        
        // Also refresh from server to ensure consistency
        console.log('Refreshing notifications list...');
        await fetchNotifications();
        console.log('Notifications refreshed');
        console.log('=== END FRONTEND DEBUG ===');
      } catch (error) {
        console.error('=== FRONTEND DELETE ERROR ===');
        console.error('Error deleting notification:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        console.error('Full error:', error);
        console.error('=== END FRONTEND ERROR ===');
        
        // Show more specific error message
        let errorMsg = 'Failed to delete notification';
        
        if (error.response?.status === 401) {
          errorMsg = 'Authentication failed. Please log in again.';
        } else if (error.response?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to delete this notification.';
        } else if (error.response?.status === 404) {
          errorMsg = 'Notification not found.';
        } else if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        setErrorMessage(errorMsg);
        setTimeout(() => setErrorMessage(''), 5000);
        
        // Remove from deleting set on error
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }
    }
  };


  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle />;
      case 'warning': return <FaExclamationTriangle />;
      case 'error': return <FaExclamationTriangle />;
      default: return <FaBell />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="admin-notifications">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="admin-notifications">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Notification Management</h1>
            <p>Send notifications to staff and manage notification history</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={fetchNotifications}
              disabled={loading}
            >
              <FaClock /> Refresh
            </button>
            <button 
              className="btn btn-outline"
              onClick={async () => {
                console.log('=== NOTIFICATION DEBUG INFO ===');
                console.log('Current notifications:', notifications);
                console.log('Current user:', user);
                console.log('Token:', localStorage.getItem('token'));
                
                // Test backend connection
                try {
                  const testResponse = await axios.get('/api/notifications/health');
                  console.log('Backend health check:', testResponse.data);
                  
                  const debugResponse = await axios.get('/api/notifications/debug');
                  console.log('Backend debug response:', debugResponse.data);
                } catch (error) {
                  console.error('Backend connection test failed:', error);
                  setErrorMessage('Backend connection failed. Please check if the server is running.');
                  setTimeout(() => setErrorMessage(''), 5000);
                }
                console.log('=== END DEBUG INFO ===');
              }}
            >
              Debug Info
            </button>
            <button 
              className="btn btn-outline"
              onClick={async () => {
                try {
                  console.log('=== CREATING TEST NOTIFICATION ===');
                  const testNotification = {
                    message: 'Test notification from admin',
                    type: 'info',
                    priority: 'medium',
                    targetRoles: ['Staff'],
                    actionUrl: ''
                  };
                  
                  const response = await axios.post('/api/notifications/broadcast', testNotification);
                  console.log('Test notification created:', response.data);
                  
                  setSuccessMessage('Test notification created!');
                  setTimeout(() => setSuccessMessage(''), 3000);
                  
                  // Refresh notifications list
                  await fetchNotifications();
                } catch (error) {
                  console.error('Error creating test notification:', error);
                  setErrorMessage('Failed to create test notification');
                  setTimeout(() => setErrorMessage(''), 5000);
                }
              }}
            >
              Create Test Notification
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowBroadcast(true)}
            >
              <FaBullhorn /> Broadcast Message
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus /> Send Notification
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <FaCheckCircle />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="error-message">
            <FaExclamationTriangle />
            <span>{errorMessage}</span>
            <button 
              className="close-error-btn"
              onClick={() => setErrorMessage('')}
              title="Close error message"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <div className="search-input">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="notifications-table-section">
          <div className="table-responsive">
            <table className="notifications-table">
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Recipients</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <tr 
                      key={notification._id}
                      className={deletingIds.has(notification._id) ? 'deleting' : ''}
                    >
                      <td>
                        <div className="notification-message">
                          <strong>{notification.message}</strong>
                          {notification.actionUrl && (
                            <small>Action: {notification.actionUrl}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span 
                          className="type-badge"
                          style={{ backgroundColor: getTypeColor(notification.type) }}
                        >
                          {getTypeIcon(notification.type)}
                          {notification.type}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(notification.priority) }}
                        >
                          {notification.priority}
                        </span>
                      </td>
                      <td>
                        <div className="recipients-info">
                          <FaUsers />
                          <span>Multiple recipients</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${notification.isRead ? 'read' : 'unread'}`}>
                          {notification.isRead ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td>
                        <div className="created-info">
                          <FaClock />
                          <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon view"
                            onClick={() => handleMarkAsRead(notification._id)}
                            title="Mark as Read"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeleteNotification(notification._id)}
                            title="Delete"
                            disabled={deletingIds.has(notification._id)}
                          >
                            {deletingIds.has(notification._id) ? (
                              <div className="loading-spinner-small"></div>
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No notifications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Send Notification Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content notification-form-modal">
              <div className="modal-header">
                <h2>Send Notification</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowForm(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSendNotification} className="notification-form">
                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows="4"
                    placeholder="Enter your notification message..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Target Roles</label>
                  <div className="checkbox-group">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.targetRoles.includes('Staff')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, targetRoles: [...prev.targetRoles, 'Staff'] }));
                          } else {
                            setFormData(prev => ({ ...prev, targetRoles: prev.targetRoles.filter(role => role !== 'Staff') }));
                          }
                        }}
                      />
                      <FaUserTie /> Staff
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.targetRoles.includes('Tailor')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, targetRoles: [...prev.targetRoles, 'Tailor'] }));
                          } else {
                            setFormData(prev => ({ ...prev, targetRoles: prev.targetRoles.filter(role => role !== 'Tailor') }));
                          }
                        }}
                      />
                      <FaUserCog /> Tailors
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.targetRoles.includes('Customer')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, targetRoles: [...prev.targetRoles, 'Customer'] }));
                          } else {
                            setFormData(prev => ({ ...prev, targetRoles: prev.targetRoles.filter(role => role !== 'Customer') }));
                          }
                        }}
                      />
                      <FaUser /> Customers
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Action URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.actionUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Sending...
                      </>
                    ) : (
                      'Send Notification'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Broadcast Modal */}
        {showBroadcast && (
          <div className="modal-overlay">
            <div className="modal-content broadcast-modal">
              <div className="modal-header">
                <h2>Broadcast Message</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowBroadcast(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleBroadcast} className="broadcast-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={broadcastData.title}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Broadcast title"
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows="4"
                    placeholder="Your broadcast message..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Target Roles</label>
                    <div className="checkbox-group">
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={broadcastData.targetRoles.includes('Staff')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBroadcastData(prev => ({ ...prev, targetRoles: [...prev.targetRoles, 'Staff'] }));
                            } else {
                              setBroadcastData(prev => ({ ...prev, targetRoles: prev.targetRoles.filter(role => role !== 'Staff') }));
                            }
                          }}
                        />
                        <FaUserTie /> Staff
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={broadcastData.targetRoles.includes('Tailor')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBroadcastData(prev => ({ ...prev, targetRoles: [...prev.targetRoles, 'Tailor'] }));
                            } else {
                              setBroadcastData(prev => ({ ...prev, targetRoles: prev.targetRoles.filter(role => role !== 'Tailor') }));
                            }
                          }}
                        />
                        <FaUserCog /> Tailors
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={broadcastData.targetRoles.includes('Customer')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBroadcastData(prev => ({ ...prev, targetRoles: [...prev.targetRoles, 'Customer'] }));
                            } else {
                              setBroadcastData(prev => ({ ...prev, targetRoles: prev.targetRoles.filter(role => role !== 'Customer') }));
                            }
                          }}
                        />
                        <FaUser /> Customers
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={broadcastData.priority}
                      onChange={(e) => setBroadcastData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Action URL (Optional)</label>
                  <input
                    type="url"
                    value={broadcastData.actionUrl}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, actionUrl: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowBroadcast(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Broadcasting...
                      </>
                    ) : (
                      'Send Broadcast'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminNotifications;
