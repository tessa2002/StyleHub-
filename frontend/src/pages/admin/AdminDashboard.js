import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  FaUsers, FaShoppingBag, FaCheckCircle, FaMoneyBillWave,
  FaPlus, FaEye, FaEdit, FaTrash, FaSearch, FaFilter,
  FaCalendarAlt, FaClock, FaBell, FaCog, FaSignOutAlt,
  FaChartLine, FaBullhorn, FaTag, FaExclamationTriangle,
  FaUserTie, FaUserCog, FaUser, FaEnvelope
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [offers, setOffers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [customersRes, ordersRes, activitiesRes, notificationsRes, fabricsRes, offersRes, staffRes] = await Promise.allSettled([
        axios.get('/api/customers'),
        axios.get('/api/orders'),
        axios.get('/api/admin/activities'),
        axios.get('/api/notifications?limit=5'),
        axios.get('/api/fabrics?limit=5'),
        axios.get('/api/offers?limit=5'),
        axios.get('/api/staff')
      ]);

      // Process customers data
      const customersData = customersRes.status === 'fulfilled' ? customersRes.value.data : {};
      const customersArray = Array.isArray(customersData.customers) ? customersData.customers : [];
      console.log('📊 Customers fetched:', customersArray.length);

      // Process orders data
      const ordersData = ordersRes.status === 'fulfilled' ? ordersRes.value.data : {};
      const ordersArray = Array.isArray(ordersData.orders) ? ordersData.orders : [];
      console.log('📦 Orders fetched:', ordersArray.length);
      console.log('📦 Orders data:', ordersArray);

      // Calculate stats - Updated to match actual order statuses
      const activeOrders = ordersArray.filter(order => {
        const status = (order.status || '').toLowerCase();
        return !status.includes('delivered') && 
               !status.includes('cancelled') &&
               order.status !== 'Completed';
      }).length;
      
      const completedOrders = ordersArray.filter(order => {
        const status = (order.status || '').toLowerCase();
        return status.includes('delivered') || 
               status.includes('ready') || 
               order.status === 'Completed';
      }).length;

      const totalRevenue = ordersArray
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Get recent orders (last 5)
      const recentOrdersData = ordersArray
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5)
        .map(order => ({
          id: order.id || order._id,
          shortId: String(order.id || order._id).slice(-6),
          customer: order.customerName || order.customer?.name || 'Unknown Customer',
          status: order.status || 'Order Placed',
          deliveryDate: order.expectedDeliveryDate || order.expectedDelivery || order.deliveryDate || null,
          amount: order.totalAmount || 0
        }));

      // Process activities
      const activitiesData = activitiesRes.status === 'fulfilled' ? activitiesRes.value.data : {};
      const activitiesArray = Array.isArray(activitiesData.activities) ? activitiesData.activities : [];

      // Process additional data
      const notificationsData = notificationsRes.status === 'fulfilled' ? notificationsRes.value.data : {};
      const fabricsData = fabricsRes.status === 'fulfilled' ? fabricsRes.value.data : {};
      const offersData = offersRes.status === 'fulfilled' ? offersRes.value.data : {};
      const staffData = staffRes.status === 'fulfilled' ? staffRes.value.data : {};

      const calculatedStats = {
        totalCustomers: customersArray.length,
        activeOrders,
        completedOrders,
        totalRevenue
      };
      
      console.log('📈 Calculated Stats:', calculatedStats);
      setStats(calculatedStats);

      setRecentOrders(recentOrdersData);
      setRecentActivities(activitiesArray);
      setNotifications(notificationsData.notifications || []);
      setFabrics(fabricsData.fabrics || []);
      setOffers(offersData.offers || []);
      setStaff(staffData.staff || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error
      setStats({ totalCustomers: 0, activeOrders: 0, completedOrders: 0, totalRevenue: 0 });
      setRecentOrders([]);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('placed')) return { bg: '#EFF6FF', text: '#2563EB' };
    if (statusLower.includes('cutting')) return { bg: '#FEF3C7', text: '#D97706' };
    if (statusLower.includes('stitching')) return { bg: '#DBEAFE', text: '#1D4ED8' };
    if (statusLower.includes('trial')) return { bg: '#E0E7FF', text: '#4F46E5' };
    if (statusLower.includes('ready')) return { bg: '#D1FAE5', text: '#059669' };
    if (statusLower.includes('delivered')) return { bg: '#DCFCE7', text: '#16A34A' };
    if (statusLower.includes('cancelled')) return { bg: '#FEE2E2', text: '#DC2626' };
    return { bg: '#F3F4F6', text: '#6B7280' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not Set';
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Not Set';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return <FaShoppingBag />;
      case 'payment': return <FaMoneyBillWave />;
      case 'customer': return <FaUsers />;
      default: return <FaBell />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="admin-dashboard">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="admin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Admin Dashboard</h1>
            <p>Manage your shop operations efficiently</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={fetchDashboardData}>
              <FaClock /> Refresh
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon customers">
              <FaUsers />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Customers</p>
              <p className="stat-value">{stats.totalCustomers}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon orders-active">
              <FaShoppingBag />
            </div>
            <div className="stat-content">
              <p className="stat-label">Active Orders</p>
              <p className="stat-value">{stats.activeOrders}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon orders-completed">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <p className="stat-label">Completed Orders</p>
              <p className="stat-value">{stats.completedOrders}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon revenue">
              <FaMoneyBillWave />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Revenue</p>
              <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section">
          <h2 className="section-title">Recent Orders</h2>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Delivery Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => {
                    const statusColors = getStatusColor(order.status);
                    return (
                      <tr key={order.id}>
                        <td>
                          <span style={{ fontWeight: '600', color: '#374151' }}>
                            #{order.shortId}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaUser style={{ fontSize: '14px', color: '#9CA3AF' }} />
                            <span>{order.customer}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '600', color: '#059669' }}>
                            ₹{order.amount.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="status-badge" 
                            style={{ 
                              backgroundColor: statusColors.bg,
                              color: statusColors.text,
                              padding: '6px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'inline-block',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaCalendarAlt style={{ fontSize: '12px', color: '#9CA3AF' }} />
                            <span style={{ color: '#6B7280' }}>
                              {formatDate(order.deliveryDate)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              onClick={() => window.location.href = `/admin/orders/${order.id}`}
                              className="btn-icon view"
                              title="View Order"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      <div style={{ padding: '40px', textAlign: 'center' }}>
                        <FaShoppingBag style={{ fontSize: '48px', color: '#D1D5DB', marginBottom: '16px' }} />
                        <p style={{ color: '#6B7280', margin: 0 }}>No recent orders found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/admin/customers/new" className="quick-action-card">
              <FaPlus className="action-icon" />
              <span className="action-label">Add Customer</span>
            </Link>
            <Link to="/admin/orders/new" className="quick-action-card">
              <FaPlus className="action-icon" />
              <span className="action-label">Create Order</span>
            </Link>
            <Link to="/admin/measurements" className="quick-action-card">
              <FaSearch className="action-icon" />
              <span className="action-label">Manage Measurements</span>
            </Link>
            <Link to="/admin/staff" className="quick-action-card">
              <FaUsers className="action-icon" />
              <span className="action-label">Manage Staff</span>
            </Link>
            <Link to="/admin/billing" className="quick-action-card">
              <FaMoneyBillWave className="action-icon" />
              <span className="action-label">Manage Billing</span>
            </Link>
            <Link to="/admin/fabrics" className="quick-action-card">
              <FaPlus className="action-icon" />
              <span className="action-label">Manage Fabrics</span>
            </Link>
            <Link to="/admin/offers" className="quick-action-card">
              <FaBell className="action-icon" />
              <span className="action-label">Manage Offers</span>
            </Link>
            <Link to="/admin/notifications" className="quick-action-card">
              <FaBullhorn className="action-icon" />
              <span className="action-label">Send Notifications</span>
            </Link>
            <Link to="/admin/settings" className="quick-action-card">
              <FaCog className="action-icon" />
              <span className="action-label">Settings</span>
            </Link>
          </div>
        </div>

        {/* Notifications Overview */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Notifications</h2>
            <Link to="/admin/notifications" className="btn btn-outline">View All</Link>
          </div>
          <div className="notifications-overview">
            {notifications.length > 0 ? (
              <div className="notifications-list">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification._id} className="notification-item">
                    <div className="notification-icon">
                      <FaBell />
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <p className="notification-time">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="notification-status">
                      <span className={`status-badge ${notification.isRead ? 'read' : 'unread'}`}>
                        {notification.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No notifications found.</p>
            )}
          </div>
        </div>

        {/* Staff Overview */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Staff Overview</h2>
            <Link to="/admin/staff" className="btn btn-outline">Manage Staff</Link>
          </div>
          <div className="staff-overview">
            {staff.length > 0 ? (
              <div className="staff-grid">
                {staff.slice(0, 4).map(member => (
                  <div key={member._id} className="staff-card">
                    <div className="staff-avatar">
                      <FaUserTie />
                    </div>
                    <div className="staff-info">
                      <h4 className="staff-name">{member.name}</h4>
                      <p className="staff-role">{member.role}</p>
                      <p className="staff-email">{member.email}</p>
                    </div>
                    <div className="staff-status">
                      <span className="status-online">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No staff members found.</p>
            )}
          </div>
        </div>

        {/* Fabrics Overview */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Fabrics</h2>
            <Link to="/admin/fabrics" className="btn btn-outline">Manage Fabrics</Link>
          </div>
          <div className="fabrics-overview">
            {fabrics.length > 0 ? (
              <div className="fabrics-list">
                {fabrics.slice(0, 3).map(fabric => (
                  <div key={fabric._id} className="fabric-item">
                    <div className="fabric-info">
                      <h4 className="fabric-name">{fabric.name}</h4>
                      <p className="fabric-details">{fabric.material} - {fabric.color}</p>
                      <p className="fabric-price">₹{fabric.price?.toLocaleString()}</p>
                    </div>
                    <div className="fabric-stock">
                      <span className={`stock-badge ${fabric.stock > 10 ? 'in-stock' : fabric.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                        {fabric.stock} {fabric.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No fabrics found.</p>
            )}
          </div>
        </div>

        {/* Offers Overview */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Active Offers</h2>
            <Link to="/admin/offers" className="btn btn-outline">Manage Offers</Link>
          </div>
          <div className="offers-overview">
            {offers.length > 0 ? (
              <div className="offers-list">
                {offers.slice(0, 3).map(offer => (
                  <div key={offer._id} className="offer-item">
                    <div className="offer-info">
                      <h4 className="offer-title">{offer.title}</h4>
                      <p className="offer-description">{offer.description}</p>
                      <p className="offer-validity">
                        Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="offer-type">
                      <span className="type-badge">{offer.offerType}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No active offers found.</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dashboard-section">
          <h2 className="section-title">Recent Activities</h2>
          <div className="activity-list">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                  <div className="activity-content">
                    <p className="activity-description">{activity.description}</p>
                    <p className="activity-timestamp">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No recent activities found.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;