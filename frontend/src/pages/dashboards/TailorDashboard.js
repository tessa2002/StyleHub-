import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaSearch, FaBell, FaRuler, FaCalendarAlt, 
  FaBox, FaCog, FaPlus, FaSignOutAlt, FaTshirt,
  FaTimes, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaClock, FaRupeeSign, FaTag
} from 'react-icons/fa';
import './TailorDashboard.css';

const TailorDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fittings, setFittings] = useState([]);
  const [stats, setStats] = useState({
    completedToday: 0,
    pendingTasks: 0,
    activeFittings: 0
  });
  const [fabrics, setFabrics] = useState([]);
  const [nextFitting, setNextFitting] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned orders
      const ordersResponse = await axios.get('/api/orders/assigned');
      const allOrders = ordersResponse.data.orders || ordersResponse.data || [];
      
      // Calculate stats
      const today = new Date().toDateString();
      const completedToday = allOrders.filter(order => 
        order.status === 'completed' && 
        new Date(order.updatedAt).toDateString() === today
      ).length;
      
      const pendingTasks = allOrders.filter(order => 
        ['pending', 'cutting', 'stitching'].includes(order.status)
      ).length;
      
      const activeFittings = allOrders.filter(order => 
        order.status === 'fitting_scheduled'
      ).length;

      // Count new orders (Assigned or Pending status)
      const newOrders = allOrders.filter(order => 
        ['Assigned', 'Pending', 'Order Placed'].includes(order.status)
      ).length;

      // Find next fitting
      const upcomingFittings = allOrders.filter(order => 
        order.status === 'fitting_scheduled' && 
        order.fittingDate && 
        new Date(order.fittingDate) > new Date()
      ).sort((a, b) => new Date(a.fittingDate) - new Date(b.fittingDate));

      setOrders(allOrders);
      setStats({ completedToday, pendingTasks, activeFittings });
      setNewOrdersCount(newOrders);
      setNextFitting(upcomingFittings[0] || null);
      
      // Fetch fabric inventory
      const fabricsResponse = await axios.get('/api/fabrics');
      setFabrics(fabricsResponse.data.fabrics || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (order) => {
    const statusProgress = {
      'pending': 10,
      'cutting': 25,
      'stitching': 50,
      'finishing': 75,
      'quality_check': 90,
      'completed': 100
    };
    return statusProgress[order.status] || 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      'cutting': '#3b82f6',
      'stitching': '#8b5cf6', 
      'finishing': '#10b981',
      'quality_check': '#f59e0b',
      'completed': '#22c55e'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    if (!status) return 'PENDING';
    
    const statusLower = status.toLowerCase();
    const labels = {
      'assigned': 'NEW ORDER',
      'pending': 'NOT STARTED',
      'order placed': 'NEW ORDER',
      'cutting': 'CUTTING STAGE',
      'stitching': 'SEWING STAGE',
      'sewing': 'SEWING STAGE',
      'finishing': 'FINAL PRESS',
      'quality_check': 'QUALITY CHECK',
      'in progress': 'IN PROGRESS',
      'completed': 'READY TODAY',
      'ready': 'READY TODAY',
      'delivered': 'DELIVERED'
    };
    return labels[statusLower] || status.toUpperCase();
  };

  const getDueText = (order) => {
    if (!order.expectedDelivery) return 'No due date';
    
    const dueDate = new Date(order.expectedDelivery);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'DUE TODAY';
    if (diffDays === 1) return 'DUE TOMORROW';
    if (diffDays > 1) return `DUE IN ${diffDays} DAYS`;
    return `OVERDUE BY ${Math.abs(diffDays)} DAYS`;
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="tailor-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="tailor-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">A</div>
            <div className="logo-text">
              <h3>Tailor Studio</h3>
              <p>PRODUCTION HUB</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/dashboard/tailor/new-orders')}>
            <FaBell className="nav-icon" />
            <span>New Orders</span>
            {newOrdersCount > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#dc3545',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {newOrdersCount}
              </span>
            )}
          </div>
          <div className="nav-item active" onClick={() => navigate('/dashboard/tailor/orders')}>
            <FaTshirt className="nav-icon" />
            <span>My Orders</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/dashboard/tailor/in-progress')}>
            <FaRuler className="nav-icon" />
            <span>In Progress</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/dashboard/tailor/ready')}>
            <FaCalendarAlt className="nav-icon" />
            <span>Ready to Deliver</span>
          </div>
          <div className="nav-item">
            <FaBox className="nav-icon" />
            <span>Inventory</span>
          </div>
          <div className="nav-item">
            <FaCog className="nav-icon" />
            <span>Settings</span>
          </div>
        </nav>

        <div className="new-job-btn">
          <button className="btn-new-job">
            <FaPlus />
            New Job
          </button>
        </div>

        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '20px' }}>
          <button 
            className="logout-btn"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(220, 53, 69, 0.1)',
              color: '#dc3545',
              border: '1px solid rgba(220, 53, 69, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#dc3545';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(220, 53, 69, 0.1)';
              e.target.style.color = '#dc3545';
            }}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Production Dashboard</h1>
          </div>
          <div className="header-center">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Find a garment or client..." />
            </div>
          </div>
          <div className="header-right">
            <div className="today-indicator">
              <span>TODAY</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
              </div>
              <span>4/10 Done</span>
            </div>
            <FaBell className="notification-icon" />
            <div className="user-avatar">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="User" />
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div className="stat-label">NEW ORDERS</div>
            <div className="stat-number">{newOrdersCount}</div>
            <div className="stat-change">Waiting to start</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">COMPLETED TODAY</div>
            <div className="stat-number">{stats.completedToday}</div>
            <div className="stat-change">Today's productivity</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">PENDING TASKS</div>
            <div className="stat-number">{stats.pendingTasks}</div>
            <div className="stat-change">Awaiting completion</div>
          </div>
          <div className="stat-card next-fitting">
            <div className="fitting-title">NEXT FITTING</div>
            {nextFitting ? (
              <>
                <div className="fitting-client">{nextFitting.customer?.name || 'Unknown Client'}</div>
                <div className="fitting-time">
                  {new Date(nextFitting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {nextFitting.relatedOrder?.itemType || 'Garment Trial'}
                </div>
              </>
            ) : (
              <div className="fitting-client">No upcoming fittings</div>
            )}
          </div>
        </div>

        {/* Active Jobs */}
        <div className="active-jobs-section">
          <div className="section-header">
            <h2>Active Jobs</h2>
            <div className="job-count">{orders.length} Total</div>
            <div className="section-filters">
              <button className="filter-btn active">All Stages</button>
              <button className="filter-btn">Priority</button>
            </div>
          </div>

          <div className="jobs-grid">
            {orders.length === 0 ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '60px 20px',
                color: '#6c757d'
              }}>
                <FaTshirt style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.3 }} />
                <h3>No Orders Found</h3>
                <p>You have no orders assigned yet.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="job-card" onClick={() => handleOrderClick(order)}>
                  <div className="job-image">
                    {order.attachments && order.attachments.length > 0 ? (
                      <img 
                        src={order.attachments[0].url || order.attachments[0]} 
                        alt={order.itemType || order.garmentType}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop';
                        }}
                      />
                    ) : (
                      <img 
                        src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop" 
                        alt={order.itemType || order.garmentType}
                      />
                    )}
                  </div>
                  <div className="progress-circle">
                    <svg className="progress-svg" viewBox="0 0 36 36">
                      <path
                        className="progress-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="progress-bar"
                        strokeDasharray={`${getProgressPercentage(order)}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="progress-text">{getProgressPercentage(order)}%</div>
                  </div>
                  <div className="job-info">
                    <h3>{order.itemType || order.garmentType || 'Custom Order'}</h3>
                    <p>Client: {order.customer?.name || order.customerName || 'Unknown'}</p>
                  </div>
                  <div className="job-status">
                    <span className={`status-badge ${order.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="due-date">{getDueText(order)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          {/* Fabric Inventory */}
          <div className="fabric-inventory">
            <h3>Fabric Inventory Status</h3>
            <div className="fabric-list">
              <div className="fabric-item">
                <div className="fabric-pattern navy"></div>
                <div className="fabric-info">
                  <div className="fabric-name">Merino Wool - Navy</div>
                  <div className="fabric-usage">Used for Mr. Harrison's Suit</div>
                </div>
                <div className="stock-status in">IN STOCK (12m)</div>
              </div>
              <div className="fabric-item">
                <div className="fabric-pattern white"></div>
                <div className="fabric-info">
                  <div className="fabric-name">Egyptian Cotton - White</div>
                  <div className="fabric-usage">Bespoke Shirts Collection</div>
                </div>
                <div className="stock-status low">LOW STOCK (2.5m)</div>
              </div>
            </div>
          </div>

          {/* Production Note */}
          <div className="production-note">
            <h3>Production Note</h3>
            <div className="note-content">
              "Remember to check the interlining on the Harrison tuxedo lapels before final stitching. The merino wool is particularly fine this batch."
            </div>
            <div className="note-author">- CHIEF TAILOR</div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderModal}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-btn" onClick={closeOrderModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              {/* Order Summary */}
              <div className="order-summary-section">
                <div className="order-image-large">
                  <img src={selectedOrder.attachments?.[0]} alt={selectedOrder.garmentType} />
                </div>
                <div className="order-basic-info">
                  <h3>{selectedOrder.garmentType}</h3>
                  <div className="order-meta">
                    <span className={`priority-badge ${selectedOrder.priority?.toLowerCase()}`}>
                      <FaTag /> {selectedOrder.priority} Priority
                    </span>
                    <span className="amount">
                      <FaRupeeSign /> ₹{selectedOrder.totalAmount?.toLocaleString()}
                    </span>
                    <span className="due-date">
                      <FaClock /> {getDueText(selectedOrder)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="info-section">
                <h4><FaUser /> Customer Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Name:</strong> {selectedOrder.customer?.name}
                  </div>
                  <div className="info-item">
                    <FaEnvelope /> {selectedOrder.customer?.email}
                  </div>
                  <div className="info-item">
                    <FaPhone /> {selectedOrder.customer?.phone}
                  </div>
                  <div className="info-item">
                    <FaMapMarkerAlt /> {selectedOrder.customer?.address}
                  </div>
                </div>
              </div>

              {/* Measurements */}
              <div className="info-section">
                <h4><FaRuler /> Measurements</h4>
                <div className="measurements-grid">
                  {selectedOrder.measurements && Object.entries(selectedOrder.measurements).map(([key, value]) => (
                    <div key={key} className="measurement-item">
                      <span className="measurement-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span className="measurement-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customizations */}
              <div className="info-section">
                <h4><FaTshirt /> Customizations</h4>
                <div className="customizations-grid">
                  {selectedOrder.customizations && Object.entries(selectedOrder.customizations).map(([key, value]) => (
                    <div key={key} className="customization-item">
                      <span className="customization-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span className="customization-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.specialInstructions && (
                <div className="info-section">
                  <h4>Special Instructions</h4>
                  <div className="special-instructions">
                    {selectedOrder.specialInstructions}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TailorDashboard;