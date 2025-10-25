import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FaShoppingCart, FaCalendarCheck, FaBell, FaUser, FaCog, FaPlus, FaEye, FaEdit,
  FaMoneyBillWave, FaRulerCombined, FaHeadset, FaChartLine, FaGift, FaDownload,
  FaPhone, FaEnvelope, FaQuestionCircle, FaStar, FaHistory, FaCreditCard,
  FaFileInvoice, FaUserEdit, FaKey, FaCamera, FaHeart, FaTag, FaComments
} from 'react-icons/fa';
import './CustomerDashboard.css';

// Helper component for order rows with bill status
const OrderRowDashboard = ({ order }) => {
  const [bill, setBill] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get(`/api/portal/bills/by-order/${order._id}`);
        if (active) setBill(data.bill);
      } catch {
        if (active) setBill(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [order._id]);

  return (
    <tr>
      <td className="order-id">#{order._id.slice(-6)}</td>
      <td>
        <span className={`status-badge status-${order.status?.toLowerCase()}`}>
          {order.status}
        </span>
      </td>
      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
      <td>₹{order.totalAmount || '0'}</td>
      <td>
        {loading ? (
          <span className="badge payment-loading">Loading…</span>
        ) : bill ? (
          <span className={`badge payment-${(bill.status || 'Pending').toLowerCase()}`}>{bill.status}</span>
        ) : (
          <span className="badge payment-none">No bill</span>
        )}
      </td>
      <td>
        <div className="action-buttons">
          <Link to={`/portal/orders`} className="btn btn-sm btn-outline" title="View Details">
            <FaEye />
          </Link>
          {!loading && bill && bill.status === 'Paid' && (
            <a 
              href={`/api/portal/bills/${bill._id}/receipt`} 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-sm btn-outline"
              title="Download Receipt"
            >
              <FaDownload />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
};

const CustomerDashboard = () => {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [measurements, setMeasurements] = useState({});
  const [bills, setBills] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch core data with better error handling
      const coreDataPromises = [
        axios.get('/api/portal/profile').catch(err => {
          console.log('Profile fetch failed:', err.message);
          return { data: { user: {}, customer: {} } };
        }),
        axios.get('/api/portal/orders').catch(err => {
          console.log('Orders fetch failed:', err.message);
          return { data: { orders: [] } };
        }),
        axios.get('/api/portal/appointments').catch(err => {
          console.log('Appointments fetch failed:', err.message);
          return { data: { appointments: [] } };
        }),
        axios.get('/api/portal/measurements').catch(err => {
          console.log('Measurements fetch failed:', err.message);
          return { data: {} };
        }),
        axios.get('/api/portal/bills').catch(err => {
          console.log('Bills fetch failed:', err.message);
          return { data: [] };
        })
      ];

      const [customerRes, ordersRes, appointmentsRes, measurementsRes, billsRes] = await Promise.all(coreDataPromises);

      // Set core data
      const profileData = customerRes.data;
      setCustomer({
        ...profileData.user,
        ...profileData.customer
      });
      setOrders(ordersRes.data.orders || []);
      setAppointments(appointmentsRes.data.appointments || []);
      setMeasurements(measurementsRes.data.current || {});
      setBills(billsRes.data.bills || []);

      // Fetch optional data with individual error handling
      const optionalDataPromises = [
        // Notifications - use the main notifications endpoint
        axios.get('/api/notifications').catch(err => {
          console.log('Notifications not available:', err.message);
          return { data: [] };
        }),
        // Loyalty points - this endpoint doesn't exist, so we'll skip it
        Promise.resolve({ data: { points: 0 } }).catch(err => {
          console.log('Loyalty points not available:', err.message);
          return { data: { points: 0 } };
        }),
        // Recent activity - this endpoint doesn't exist, so we'll skip it
        Promise.resolve({ data: [] }).catch(err => {
          console.log('Recent activity not available:', err.message);
          return { data: [] };
        }),
        // Upcoming deliveries - this endpoint doesn't exist, so we'll skip it
        Promise.resolve({ data: [] }).catch(err => {
          console.log('Upcoming deliveries not available:', err.message);
          return { data: [] };
        }),
        // Fabrics
        axios.get('/api/fabrics?limit=6').catch(err => {
          console.log('Fabrics not available:', err.message);
          return { data: { fabrics: [] } };
        }),
        // Offers
        axios.get('/api/offers?limit=3').catch(err => {
          console.log('Offers not available:', err.message);
          return { data: { offers: [] } };
        })
      ];

      const [notificationsRes, loyaltyRes, activityRes, deliveriesRes, fabricsRes, offersRes] = await Promise.all(optionalDataPromises);

      // Set optional data
      setNotifications(notificationsRes.data.notifications || []);
      setLoyaltyPoints(loyaltyRes.data.points || 0);
      setRecentActivity(activityRes.data || []);
      setUpcomingDeliveries(deliveriesRes.data || []);
      setFabrics(fabricsRes.data.fabrics || []);
      setOffers(offersRes.data.offers || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Only set error for critical failures, not missing optional data
      if (error.response?.status >= 500) {
        setError('Unable to load some dashboard data. Please refresh the page or try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const upcomingAppts = appointments.filter(apt => new Date(apt.scheduledAt || apt.date) > new Date()).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingBills = bills.filter(bill => bill.status === 'Pending').length;
  const paidBills = bills.filter(bill => bill.status === 'Paid').length;
  
  // Get personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        {/* Error Message */}
        {error && (
          <div className="error-banner" style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaBell />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                marginLeft: 'auto',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
        )}
        
        {/* Welcome Header */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">{getGreeting()}, {customer?.name || "Customer"}!</h1>
            <p className="welcome-subtitle">Here's what's happening with your orders and appointments</p>
          </div>
          <div className="welcome-actions">
            <Link to="/portal/orders/new" className="btn btn-primary">
              <FaPlus />
              New Order
            </Link>
            <Link to="/portal/appointments" className="btn btn-secondary">
              <FaCalendarCheck />
              Book Appointment
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-header">
              <div className="card-icon">
                <FaShoppingCart />
              </div>
              <div className="card-title">Total Orders</div>
            </div>
            <div className="card-content">
              <div className="card-value">{totalOrders}</div>
              <div className="card-description">
                {pendingOrders} pending, {completedOrders} completed, {deliveredOrders} delivered
              </div>
            </div>
            <div className="card-footer">
              <Link to="/portal/orders" className="card-link">View All Orders</Link>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-header">
              <div className="card-icon">
                <FaCalendarCheck />
              </div>
              <div className="card-title">Upcoming Appointments</div>
            </div>
            <div className="card-content">
              <div className="card-value">{upcomingAppts}</div>
              <div className="card-description">Scheduled appointments</div>
            </div>
            <div className="card-footer">
              <Link to="/portal/appointments" className="card-link">Manage Appointments</Link>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-header">
              <div className="card-icon">
                <FaMoneyBillWave />
              </div>
              <div className="card-title">Total Spent</div>
            </div>
            <div className="card-content">
              <div className="card-value">₹{totalSpent.toFixed(2)}</div>
              <div className="card-description">Lifetime spending</div>
            </div>
            <div className="card-footer">
              <Link to="/portal/bills" className="card-link">View Bills</Link>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-header">
              <div className="card-icon">
                <FaGift />
              </div>
              <div className="card-title">Loyalty Points</div>
            </div>
            <div className="card-content">
              <div className="card-value">{loyaltyPoints}</div>
              <div className="card-description">Available points</div>
            </div>
            <div className="card-footer">
              <Link to="/portal/loyalty" className="card-link">View Rewards</Link>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Orders</h2>
            <Link to="/portal/orders" className="btn btn-outline">View All</Link>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Status</th>
                  <th>Placed</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.slice(0, 5).map(order => (
                    <OrderRowDashboard key={order._id} order={order} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div className="empty-content">
                        <FaShoppingCart className="empty-icon" />
                        <p>No orders yet</p>
                        <Link to="/portal/orders/new" className="btn btn-primary">Place Your First Order</Link>
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
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div className="quick-actions-grid">
            <Link to="/portal/orders/new" className="quick-action-card">
              <div className="action-icon">
                <FaPlus />
              </div>
              <div className="action-content">
                <h3 className="action-title">New Order</h3>
                <p className="action-description">Place a new order</p>
              </div>
            </Link>
            
            <Link to="/portal/appointments" className="quick-action-card">
              <div className="action-icon">
                <FaCalendarCheck />
              </div>
              <div className="action-content">
                <h3 className="action-title">Book Appointment</h3>
                <p className="action-description">Schedule fitting</p>
              </div>
            </Link>
            
            <Link to="/portal/measurements" className="quick-action-card">
              <div className="action-icon">
                <FaUser />
              </div>
              <div className="action-content">
                <h3 className="action-title">Measurements</h3>
                <p className="action-description">Update sizes</p>
              </div>
            </Link>
            
            <Link to="/portal/support" className="quick-action-card">
              <div className="action-icon">
                <FaCog />
              </div>
              <div className="action-content">
                <h3 className="action-title">Support</h3>
                <p className="action-description">Get help</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Profile Management Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Profile Management</h2>
            <Link to="/portal/profile" className="btn btn-outline">Manage Profile</Link>
          </div>
          <div className="profile-overview">
            <div className="profile-info">
              <div className="profile-avatar">
                <FaUser />
              </div>
              <div className="profile-details">
                <h3>{customer?.name || 'Customer Name'}</h3>
                <p>{customer?.email || 'customer@email.com'}</p>
                <p>{customer?.phone || 'Phone number'}</p>
              </div>
            </div>
            <div className="profile-actions">
              <Link to="/portal/profile" className="btn btn-sm btn-outline">
                <FaUserEdit /> Edit Profile
              </Link>
              <Link to="/portal/profile/password" className="btn btn-sm btn-outline">
                <FaKey /> Change Password
              </Link>
              <Link to="/portal/profile/photo" className="btn btn-sm btn-outline">
                <FaCamera /> Upload Photo
              </Link>
            </div>
          </div>
        </div>

        {/* Measurements Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Your Measurements</h2>
            <Link to="/portal/measurements" className="btn btn-outline">Update Measurements</Link>
          </div>
          <div className="measurements-overview">
            {Object.keys(measurements).length > 0 ? (
              <div className="measurements-grid">
                {Object.entries(measurements).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="measurement-item">
                    <span className="measurement-label">{key}</span>
                    <span className="measurement-value">{value || 'Not set'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaRulerCombined className="empty-icon" />
                <p>No measurements saved yet</p>
                <Link to="/portal/measurements" className="btn btn-primary">Add Measurements</Link>
              </div>
            )}
          </div>
        </div>

        {/* Bills & Payments Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Bills & Payments</h2>
            <Link to="/portal/bills" className="btn btn-outline">View All Bills</Link>
          </div>
          <div className="bills-overview">
            <div className="bills-stats">
              <div className="bill-stat">
                <span className="stat-label">Pending Bills</span>
                <span className="stat-value pending">{pendingBills}</span>
              </div>
              <div className="bill-stat">
                <span className="stat-label">Paid Bills</span>
                <span className="stat-value paid">{paidBills}</span>
              </div>
            </div>
            <div className="bills-actions">
              <Link to="/portal/bills" className="btn btn-sm btn-outline">
                <FaFileInvoice /> View Bills
              </Link>
              <Link to="/portal/payments" className="btn btn-sm btn-outline">
                <FaCreditCard /> Make Payment
              </Link>
              <Link to="/portal/bills/download" className="btn btn-sm btn-outline">
                <FaDownload /> Download Invoices
              </Link>
            </div>
          </div>
        </div>

        {/* Notifications Center */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Notifications Center</h2>
            <Link to="/portal/notifications" className="btn btn-outline">View All</Link>
          </div>
          <div className="notifications-overview">
            {notifications.length > 0 ? (
              <div className="notifications-list">
                {notifications.slice(0, 3).map((notification, index) => (
                  <div key={index} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                    <div className="notification-icon">
                      <FaBell />
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaBell className="empty-icon" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Support & Help Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Support & Help</h2>
            <Link to="/portal/support" className="btn btn-outline">Get Support</Link>
          </div>
          <div className="support-overview">
            <div className="support-options">
              <Link to="/portal/support/chat" className="support-option">
                <FaComments />
                <span>Live Chat</span>
              </Link>
              <Link to="/portal/support/email" className="support-option">
                <FaEnvelope />
                <span>Email Support</span>
              </Link>
              <Link to="/portal/support/phone" className="support-option">
                <FaPhone />
                <span>Call Us</span>
              </Link>
              <Link to="/portal/support/faq" className="support-option">
                <FaQuestionCircle />
                <span>FAQ</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Offers Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Special Offers</h2>
            <Link to="/offers" className="btn btn-outline">View All Offers</Link>
          </div>
          <div className="offers-overview">
            {offers.length > 0 ? (
              <div className="offers-grid">
                {offers.map(offer => (
                  <div key={offer._id} className="offer-card">
                    <div className="offer-header">
                      <h3 className="offer-title">{offer.title}</h3>
                      <span className="offer-type">{offer.offerType}</span>
                    </div>
                    <div className="offer-content">
                      <p className="offer-description">{offer.description}</p>
                      {offer.discountType !== 'none' && (
                        <div className="offer-discount">
                          <span className="discount-value">
                            {offer.discountType === 'percentage' 
                              ? `${offer.discountValue}% OFF`
                              : `₹${offer.discountValue} OFF`
                            }
                          </span>
                        </div>
                      )}
                      <div className="offer-validity">
                        <span className="valid-until">
                          Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                      {offer.actionUrl && (
                        <a 
                          href={offer.actionUrl} 
                          className="offer-action-btn"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {offer.actionText || 'View Details'}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaBell className="empty-icon" />
                <p>No special offers available</p>
              </div>
            )}
          </div>
        </div>

        {/* Fabrics Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Available Fabrics</h2>
            <Link to="/fabrics" className="btn btn-outline">View All Fabrics</Link>
          </div>
          <div className="fabrics-overview">
            {fabrics.length > 0 ? (
              <div className="fabrics-grid">
                {fabrics.map(fabric => (
                  <div key={fabric._id} className="fabric-card">
                    <div className="fabric-image">
                      {fabric.images && fabric.images.length > 0 ? (
                        <img src={fabric.images[0].url} alt={fabric.name} />
                      ) : (
                        <div className="fabric-placeholder">
                          <FaTag />
                        </div>
                      )}
                    </div>
                    <div className="fabric-info">
                      <h3 className="fabric-name">{fabric.name}</h3>
                      <p className="fabric-material">{fabric.material} - {fabric.color}</p>
                      <div className="fabric-details">
                        <span className="fabric-category">{fabric.category}</span>
                        <span className="fabric-stock">{fabric.stock} {fabric.unit}</span>
                      </div>
                      <div className="fabric-price">
                        <span className="price">₹{fabric.price?.toLocaleString()}</span>
                        <span className="unit">per {fabric.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaTag className="empty-icon" />
                <p>No fabrics available</p>
              </div>
            )}
          </div>
        </div>

        {/* Settings Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Settings</h2>
            <Link to="/portal/settings" className="btn btn-outline">Manage Settings</Link>
          </div>
          <div className="settings-overview">
            <div className="settings-options">
              <Link to="/portal/settings/account" className="settings-option">
                <FaUser />
                <span>Account Settings</span>
              </Link>
              <Link to="/portal/settings/notifications" className="settings-option">
                <FaBell />
                <span>Notification Preferences</span>
              </Link>
              <Link to="/portal/settings/privacy" className="settings-option">
                <FaCog />
                <span>Privacy Settings</span>
              </Link>
              <Link to="/portal/settings/preferences" className="settings-option">
                <FaHeart />
                <span>Style Preferences</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;