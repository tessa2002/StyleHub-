import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StaffSidebar from '../../components/StaffSidebar';
import {
  FaBox, FaClock, FaCheckCircle, FaTruck, FaBell, FaUser, FaCog,
  FaSignOutAlt, FaPlus, FaEye, FaEdit, FaCalendarAlt, FaRuler
} from 'react-icons/fa';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    pendingDelivery: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTailor, setSelectedTailor] = useState('');
  const [tailors, setTailors] = useState([]);
  const [unassignedOrders, setUnassignedOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch assigned orders
      const ordersResponse = await fetch('/api/orders/assigned', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const ordersData = await ordersResponse.json();
      setOrders(ordersData.orders || []);

      // Fetch unassigned orders
      const unassignedResponse = await fetch('/api/orders/unassigned', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const unassignedData = await unassignedResponse.json();
      setUnassignedOrders(unassignedData.orders || []);

      // Fetch tailors
      const tailorsResponse = await fetch('/api/staff/tailors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const tailorsData = await tailorsResponse.json();
      setTailors(tailorsData.users || []);

      // Fetch notifications
      const notificationsResponse = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const notificationsData = await notificationsResponse.json();
      setNotifications(notificationsData.notifications || []);

      // Calculate stats
      const assigned = ordersData.orders?.length || 0;
      const inProgress = ordersData.orders?.filter(order => order.status === 'In Progress').length || 0;
      const completed = ordersData.orders?.filter(order => order.status === 'Completed').length || 0;
      const pendingDelivery = ordersData.orders?.filter(order => order.status === 'Ready for Delivery').length || 0;

      setStats({ assigned, inProgress, completed, pendingDelivery });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodaysTasks = () => {
    const today = new Date();
    return orders.filter(order => {
      const orderDate = new Date(order.expectedDeliveryDate);
      return orderDate.toDateString() === today.toDateString();
    });
  };

  const handleStatusUpdate = async (orderId, newStatus, note) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
        status: newStatus,
          note: note 
        })
      });
      
      if (response.ok) {
      // Update local state
        setOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
        
        // Recalculate stats
        const updatedOrders = orders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        );
        
        const assigned = updatedOrders.length;
        const inProgress = updatedOrders.filter(order => order.status === 'In Progress').length;
        const completed = updatedOrders.filter(order => order.status === 'Completed').length;
        const pendingDelivery = updatedOrders.filter(order => order.status === 'Ready for Delivery').length;
        
        setStats({ assigned, inProgress, completed, pendingDelivery });
        
        setShowStatusModal(false);
        setSelectedOrder(null);
        setNewStatus('');
        setStatusNote('');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleAssignOrder = async (orderId, tailorId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ tailorId })
      });

      if (response.ok) {
        // Remove from unassigned and add to assigned
        setUnassignedOrders(prev => prev.filter(order => order._id !== orderId));
        setShowAssignModal(false);
        setSelectedOrder(null);
        setSelectedTailor('');
        
        // Refresh data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error assigning order:', error);
    }
  };

  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setShowAssignModal(true);
  };

  const renderDashboard = () => (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Here's your work overview for today</p>
              </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card assigned">
          <div className="stat-icon">
            <FaBox />
          </div>
          <div className="stat-content">
            <h3>{stats.assigned}</h3>
            <p>Orders Assigned</p>
          </div>
        </div>

        <div className="stat-card in-progress">
          <div className="stat-icon">
            <FaClock />
            </div>
            <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
            </div>
          </div>

        <div className="stat-card completed">
          <div className="stat-icon">
            <FaCheckCircle />
            </div>
            <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
            </div>
          </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <FaTruck />
            </div>
            <div className="stat-content">
            <h3>{stats.pendingDelivery}</h3>
            <p>Pending Delivery</p>
          </div>
        </div>
            </div>

      <div className="dashboard-content">
        {/* Today's Tasks */}
        <div className="dashboard-section">
          <h2>Today's Tasks</h2>
            <div className="tasks-list">
            {getTodaysTasks().length > 0 ? (
              getTodaysTasks().map(order => (
                <div key={order._id} className="task-item">
                  <div className="task-info">
                    <h4>{order.orderNumber}</h4>
                    <p>{order.customerName} - {order.garmentType}</p>
                    <span className={`task-status status-${order.status.toLowerCase().replace(' ', '-')}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setActiveTab('orders')}
                    >
                      <FaEye /> View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-tasks">
                <FaCheckCircle className="no-tasks-icon" />
                <p>No tasks due today! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Unassigned Orders Alert */}
        {unassignedOrders.length > 0 && (
          <div className="dashboard-section unassigned-alert">
            <h2>⚠️ Unassigned Orders</h2>
            <p>{unassignedOrders.length} orders need to be assigned to tailors</p>
            <button 
              className="btn btn-primary"
              onClick={() => setActiveTab('assignments')}
            >
              <FaPlus /> Assign Orders
            </button>
          </div>
        )}

        {/* Notifications */}
        <div className="dashboard-section">
          <h2>Recent Notifications</h2>
          <div className="notifications-list">
            {notifications.slice(0, 5).map(notification => (
              <div key={notification._id} className="notification-item">
                <div className="notification-icon">
                  <FaBell />
                </div>
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <small>{new Date(notification.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="no-notifications">
                <FaBell className="no-notifications-icon" />
                <p>No new notifications</p>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="orders-section">
            <div className="section-header">
        <h1>My Assigned Orders</h1>
        <div className="section-actions">
          <button className="btn btn-primary">
            <FaPlus /> New Order
              </button>
            </div>
      </div>

      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>{order.orderNumber}</h3>
                  <p>{order.customerName} - {order.garmentType}</p>
                </div>
                <div className="order-status">
                  <span className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Customer:</span>
                  <span className="detail-value">{order.customerName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Garment:</span>
                  <span className="detail-value">{order.garmentType}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Delivery Date:</span>
                  <span className="detail-value">
                    {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                    </span>
                  </div>
              </div>

              <div className="order-actions">
                <button className="btn btn-outline">
                  <FaEye /> View Details
                </button>
                  <button 
                  className="btn btn-primary"
                  onClick={() => openStatusModal(order)}
                  >
                  <FaEdit /> Update Status
                  </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-orders">
            <FaBox className="no-orders-icon" />
            <h3>No orders assigned</h3>
            <p>You don't have any orders assigned to you yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-section">
      <div className="section-header">
        <h1>Profile & Settings</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h2>{user?.name}</h2>
              <p>{user?.role}</p>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h3>Account Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{user?.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{user?.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">{user?.role}</span>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn btn-primary">
                <FaEdit /> Edit Profile
              </button>
              <button className="btn btn-outline">
                <FaCog /> Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMeasurements = () => (
    <div className="measurements-section">
            <div className="section-header">
        <h1>Measurements Access</h1>
        <p>View and manage measurements for your assigned orders</p>
      </div>

      <div className="measurements-list">
        {orders.length > 0 ? (
          orders.map(order => (
            <div key={order._id} className="measurement-card">
              <div className="measurement-header">
                <h3>{order.orderNumber}</h3>
                <p>{order.customerName} - {order.garmentType}</p>
              </div>
              
              <div className="measurement-actions">
                <button className="btn btn-outline">
                  <FaRuler /> View Measurements
                </button>
                <button className="btn btn-outline">
                  <FaCalendarAlt /> Download
              </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-measurements">
            <FaRuler className="no-measurements-icon" />
            <h3>No measurements available</h3>
            <p>You don't have any orders with measurements yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="calendar-section">
      <div className="section-header">
        <h1>Work Calendar</h1>
        <p>Track your deadlines and manage your workload</p>
      </div>

      <div className="calendar-overview">
        <div className="calendar-stats">
          <div className="stat-item">
            <h3>{getTodaysTasks().length}</h3>
            <p>Due Today</p>
          </div>
          <div className="stat-item">
            <h3>{orders.filter(order => new Date(order.expectedDeliveryDate) > new Date()).length}</h3>
            <p>Upcoming</p>
          </div>
          <div className="stat-item">
            <h3>{orders.filter(order => new Date(order.expectedDeliveryDate) < new Date() && order.status !== 'Completed').length}</h3>
            <p>Overdue</p>
          </div>
        </div>

        <div className="upcoming-deadlines">
          <h2>Upcoming Deadlines</h2>
          <div className="deadlines-list">
            {orders
              .filter(order => new Date(order.expectedDeliveryDate) >= new Date())
              .sort((a, b) => new Date(a.expectedDeliveryDate) - new Date(b.expectedDeliveryDate))
              .slice(0, 5)
              .map(order => (
                <div key={order._id} className="deadline-item">
                  <div className="deadline-date">
                    {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                  </div>
                  <div className="deadline-info">
                    <h4>{order.orderNumber}</h4>
                    <p>{order.customerName} - {order.garmentType}</p>
                    <span className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
                </div>
                </div>
            </div>
  );

  const renderAssignments = () => (
    <div className="assignments-section">
            <div className="section-header">
        <h1>Order Assignments</h1>
        <p>Assign customer orders to tailors for processing</p>
            </div>

      <div className="assignments-content">
        {/* Unassigned Orders */}
        <div className="unassigned-orders">
          <h2>Unassigned Orders ({unassignedOrders.length})</h2>
            <div className="orders-list">
            {unassignedOrders.length > 0 ? (
              unassignedOrders.map(order => (
                <div key={order._id} className="order-card unassigned">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>{order.orderNumber}</h3>
                      <p>{order.customerName} - {order.garmentType}</p>
                      <div className="order-meta">
                        <span className="priority-badge urgent">Unassigned</span>
                        <span className="delivery-date">
                          Due: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                    </span>
                      </div>
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">Customer:</span>
                      <span className="detail-value">{order.customerName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Garment:</span>
                      <span className="detail-value">{order.garmentType}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Order Date:</span>
                      <span className="detail-value">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => openAssignModal(order)}
                    >
                      <FaPlus /> Assign to Tailor
                    </button>
                    <button className="btn btn-outline">
                      <FaEye /> View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-orders">
                <FaCheckCircle className="no-orders-icon" />
                <h3>All orders assigned!</h3>
                <p>Great job! All orders have been assigned to tailors.</p>
                </div>
              )}
          </div>
        </div>

        {/* Assigned Orders Summary */}
        <div className="assigned-summary">
          <h2>Assignment Summary</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>{orders.length}</h3>
              <p>Assigned Orders</p>
            </div>
            <div className="summary-card">
              <h3>{unassignedOrders.length}</h3>
              <p>Unassigned Orders</p>
                </div>
            <div className="summary-card">
              <h3>{tailors.length}</h3>
              <p>Available Tailors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'orders':
        return renderOrders();
      case 'assignments':
        return renderAssignments();
      case 'measurements':
        return renderMeasurements();
      case 'calendar':
        return renderCalendar();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="staff-layout">
      <StaffSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="staff-main-content">
        {renderContent()}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Order Status</h2>
            <button 
                className="close-btn"
                onClick={() => setShowStatusModal(false)}
            >
                ×
            </button>
            </div>

            <div className="modal-body">
              <div className="order-info">
                <h3>{selectedOrder.orderNumber}</h3>
                <p>{selectedOrder.customerName} - {selectedOrder.garmentType}</p>
              </div>

              <div className="form-group">
                <label>New Status:</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Ready for Delivery">Ready for Delivery</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status Note (Optional):</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add any notes about the status change..."
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="modal-actions">
            <button 
                  className="btn btn-outline"
                  onClick={() => setShowStatusModal(false)}
            >
                  Cancel
            </button>
            <button 
                  className="btn btn-primary"
                  onClick={() => handleStatusUpdate(selectedOrder._id, newStatus, statusNote)}
            >
                  Update Status
            </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Order to Tailor</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="order-info">
                <h3>{selectedOrder.orderNumber}</h3>
                <p>{selectedOrder.customerName} - {selectedOrder.garmentType}</p>
                <p>Due: {new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString()}</p>
              </div>

              <div className="form-group">
                <label>Select Tailor:</label>
                <select 
                  value={selectedTailor}
                  onChange={(e) => setSelectedTailor(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a tailor...</option>
                  {tailors.map(tailor => (
                    <option key={tailor._id} value={tailor._id}>
                      {tailor.name} ({tailor.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="tailor-info">
                {selectedTailor && (
                  <div className="selected-tailor">
                    {(() => {
                      const tailor = tailors.find(t => t._id === selectedTailor);
                      return tailor ? (
                        <div>
                          <h4>Selected Tailor:</h4>
                          <p><strong>Name:</strong> {tailor.name}</p>
                          <p><strong>Email:</strong> {tailor.email}</p>
                          <p><strong>Phone:</strong> {tailor.phone || 'Not provided'}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
        </div>
        
              <div className="modal-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleAssignOrder(selectedOrder._id, selectedTailor)}
                  disabled={!selectedTailor}
                >
                  Assign Order
                </button>
              </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;