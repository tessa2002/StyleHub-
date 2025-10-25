import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TailorSidebar from '../../components/TailorSidebar';
import { 
  FaShoppingBag, FaClock, FaTools, FaCheckCircle,
  FaExclamationTriangle, FaCalendarAlt, FaUser, FaTshirt,
  FaEye, FaArrowRight, FaFire
} from 'react-icons/fa';
import './TailorDashboard.css';

const TailorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    urgent: 0
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds to check for new assignments
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      fetchDashboardData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard data for tailor:', user?._id);
      
      const response = await axios.get('/api/orders/assigned');
      console.log('📦 API Response:', response.data);
      
      const allOrders = response.data.orders || response.data || [];
      console.log(`✅ Loaded ${allOrders.length} orders`);
      
      // Log each order's details for debugging
      if (allOrders.length > 0) {
        console.log('📋 Order List:');
        allOrders.forEach((order, idx) => {
          console.log(`   ${idx + 1}. Order #${order._id?.toString().slice(-6)} - ${order.itemType} - Status: ${order.status}`);
        });
      }
      
      setOrders(allOrders);
      calculateStats(allOrders);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      console.error('Error details:', error.response?.data);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData) => {
    const total = ordersData.length;
    const pending = ordersData.filter(o => ['Pending', 'Order Placed'].includes(o.status)).length;
    const inProgress = ordersData.filter(o => ['Cutting', 'Stitching', 'Trial'].includes(o.status)).length;
    const completed = ordersData.filter(o => ['Ready', 'Delivered'].includes(o.status)).length;
    
    // Calculate urgent orders (due within 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const urgent = ordersData.filter(order => {
      const dueDate = new Date(order.expectedDelivery || order.deliveryDate);
      return dueDate <= threeDaysFromNow && !['Ready', 'Delivered', 'Cancelled'].includes(order.status);
    }).length;

    const newStats = { total, pending, inProgress, completed, urgent };
    console.log('📊 Stats Calculated:', newStats);
    console.log('   - Total:', total);
    console.log('   - Pending:', pending);
    console.log('   - In Progress:', inProgress);
    console.log('   - Completed:', completed);
    console.log('   - Urgent:', urgent);
    
    setStats(newStats);
    console.log('✅ Stats state updated');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRecentOrders = () => {
    return orders.slice(0, 5);
  };

  const getUrgentOrders = () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return orders.filter(order => {
      const dueDate = new Date(order.expectedDelivery || order.deliveryDate);
      return dueDate <= threeDaysFromNow && !['Ready', 'Delivered', 'Cancelled'].includes(order.status);
    }).slice(0, 5);
  };

  if (loading) {
    return (
      <div className="tailor-layout">
        <TailorSidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={handleLogout}
        />
        <div className={`tailor-main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="dashboard-page">
            <div className="dashboard-loading">
              <div className="loading-spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recentOrders = getRecentOrders();
  const urgentOrders = getUrgentOrders();

  return (
    <div className="tailor-layout">
      <TailorSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />
      <div className={`tailor-main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="dashboard-page">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-content">
              <h1>{getGreeting()}, {user?.name || 'Tailor'}! 👋</h1>
              <p>Here's what's happening with your work today</p>
            </div>
            <div className="welcome-actions">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  fetchDashboardData();
                }}
                style={{ marginRight: '10px' }}
              >
                <FaArrowRight style={{ transform: 'rotate(-90deg)' }} /> Refresh
              </button>
              <button 
                className="btn btn-white"
                onClick={() => navigate('/dashboard/tailor/orders')}
              >
                <FaShoppingBag /> View All Orders
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-header">
                <div className="card-icon">
                  <FaShoppingBag />
                </div>
                <div className="card-title">Total Orders</div>
              </div>
              <div className="card-content">
                <div className="card-value">{stats.total}</div>
                <div className="card-description">All assigned orders</div>
              </div>
              <div className="card-footer">
                <button onClick={() => navigate('/dashboard/tailor/orders')} className="card-link">
                  View All <FaArrowRight />
                </button>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <div className="card-icon" style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
                  <FaClock />
                </div>
                <div className="card-title">Pending</div>
              </div>
              <div className="card-content">
                <div className="card-value">{stats.pending}</div>
                <div className="card-description">Not yet started</div>
              </div>
              <div className="card-footer">
                <button onClick={() => navigate('/dashboard/tailor/orders')} className="card-link">
                  Start Work <FaArrowRight />
                </button>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <div className="card-icon" style={{background: 'linear-gradient(135deg, #3b82f6, #2563eb)'}}>
                  <FaTools />
                </div>
                <div className="card-title">In Progress</div>
              </div>
              <div className="card-content">
                <div className="card-value">{stats.inProgress}</div>
                <div className="card-description">Active work</div>
              </div>
              <div className="card-footer">
                <button onClick={() => navigate('/dashboard/tailor/in-progress')} className="card-link">
                  View Details <FaArrowRight />
                </button>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <div className="card-icon" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                  <FaCheckCircle />
                </div>
                <div className="card-title">Completed</div>
              </div>
              <div className="card-content">
                <div className="card-value">{stats.completed}</div>
                <div className="card-description">Ready for delivery</div>
              </div>
              <div className="card-footer">
                <button onClick={() => navigate('/dashboard/tailor/completed')} className="card-link">
                  View All <FaArrowRight />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="dashboard-grid">
            {/* Recent Orders */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FaShoppingBag /> Recent Orders
                </h2>
                <button onClick={() => navigate('/dashboard/tailor/orders')} className="btn btn-sm btn-outline">
                  View All
                </button>
              </div>
              {recentOrders.length === 0 ? (
                <div className="empty-state">
                  <FaShoppingBag className="empty-icon" />
                  <p>No orders assigned yet</p>
                </div>
              ) : (
                <div className="orders-list">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="order-item">
                      <div className="order-info">
                        <div className="order-id">#{String(order._id).slice(-6).toUpperCase()}</div>
                        <div className="order-details">
                          <div className="order-meta">
                            <span><FaUser /> {order.customer?.name || 'Customer'}</span>
                            <span><FaTshirt /> {order.itemType || 'Custom'}</span>
                          </div>
                          <div className="order-date">
                            <FaCalendarAlt /> Due: {formatDate(order.expectedDelivery || order.deliveryDate)}
                          </div>
                        </div>
                      </div>
                      <div className="order-actions">
                        <span className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
                          {order.status}
                        </span>
                        <button 
                          className="btn btn-sm btn-icon"
                          onClick={() => navigate(`/dashboard/tailor/order/${order._id}`)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Urgent Orders */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FaExclamationTriangle /> Urgent Orders
                  {stats.urgent > 0 && <span className="badge badge-danger">{stats.urgent}</span>}
                </h2>
                <button onClick={() => navigate('/dashboard/tailor/urgent')} className="btn btn-sm btn-outline">
                  View All
                </button>
              </div>
              {urgentOrders.length === 0 ? (
                <div className="empty-state">
                  <FaCheckCircle className="empty-icon" style={{color: '#10b981'}} />
                  <p>No urgent orders! You're all caught up! ✨</p>
                </div>
              ) : (
                <div className="orders-list">
                  {urgentOrders.map((order) => {
                    const dueDate = new Date(order.expectedDelivery || order.deliveryDate);
                    const today = new Date();
                    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysUntilDue < 0;

                    return (
                      <div key={order._id} className={`order-item ${isOverdue ? 'urgent' : ''}`}>
                        <div className="order-info">
                          <div className="order-id">#{String(order._id).slice(-6).toUpperCase()}</div>
                          <div className="order-details">
                            <div className="order-meta">
                              <span><FaUser /> {order.customer?.name || 'Customer'}</span>
                              <span><FaTshirt /> {order.itemType || 'Custom'}</span>
                            </div>
                            <div className="order-date urgent-date">
                              <FaFire /> {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : daysUntilDue === 0 ? 'Due Today' : `${daysUntilDue} days left`}
                            </div>
                          </div>
                        </div>
                        <div className="order-actions">
                          <span className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
                            {order.status}
                          </span>
                          <button 
                            className="btn btn-sm btn-icon"
                            onClick={() => navigate(`/dashboard/tailor/order/${order._id}`)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <button className="quick-action-card" onClick={() => navigate('/dashboard/tailor/orders')}>
                <div className="qa-icon"><FaShoppingBag /></div>
                <div className="qa-title">View All Orders</div>
                <div className="qa-desc">See all assigned work</div>
              </button>
              <button className="quick-action-card" onClick={() => navigate('/dashboard/tailor/in-progress')}>
                <div className="qa-icon"><FaTools /></div>
                <div className="qa-title">Work In Progress</div>
                <div className="qa-desc">Active orders</div>
              </button>
              <button className="quick-action-card" onClick={() => navigate('/dashboard/tailor/measurements')}>
                <div className="qa-icon"><FaTshirt /></div>
                <div className="qa-title">Measurements</div>
                <div className="qa-desc">View designs</div>
              </button>
              <button className="quick-action-card" onClick={() => navigate('/dashboard/tailor/calendar')}>
                <div className="qa-icon"><FaCalendarAlt /></div>
                <div className="qa-title">Calendar</div>
                <div className="qa-desc">Check deadlines</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorDashboard;
