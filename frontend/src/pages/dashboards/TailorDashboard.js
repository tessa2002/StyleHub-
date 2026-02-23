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

      // Find next fitting
      const upcomingFittings = allOrders.filter(order => 
        order.status === 'fitting_scheduled' && 
        order.fittingDate && 
        new Date(order.fittingDate) > new Date()
      ).sort((a, b) => new Date(a.fittingDate) - new Date(b.fittingDate));

      setOrders(allOrders);
      setStats({ completedToday, pendingTasks, activeFittings });
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
    const labels = {
      'cutting': 'CUTTING STAGE',
      'stitching': 'SEWING STAGE', 
      'finishing': 'FINAL PRESS',
      'quality_check': 'PATTERN MAKING',
      'completed': 'READY TODAY'
    };
    return labels[status] || status.toUpperCase();
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
          <div className="nav-item active">
            <FaTshirt className="nav-icon" />
            <span>My Work</span>
          </div>
          <div className="nav-item">
            <FaRuler className="nav-icon" />
            <span>Measurements</span>
          </div>
          <div className="nav-item">
            <FaCalendarAlt className="nav-icon" />
            <span>Schedule</span>
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
          <div className="stat-card">
            <div className="stat-label">ACTIVE FITTINGS</div>
            <div className="stat-number">{stats.activeFittings}</div>
            <div className="stat-change">Scheduled trials</div>
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
            <div className="job-count">12 Total</div>
            <div className="section-filters">
              <button className="filter-btn active">All Stages</button>
              <button className="filter-btn">Priority</button>
            </div>
          </div>

          <div className="jobs-grid">
            {/* Three-Piece Suit */}
            <div className="job-card" onClick={() => handleOrderClick({
              _id: '1',
              garmentType: 'Three-Piece Suit',
              customer: { 
                name: 'Mr. Harrison',
                email: 'harrison@email.com',
                phone: '+91 98765 43210',
                address: '123 Business District, Mumbai'
              },
              status: 'stitching',
              expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              priority: 'Standard',
              totalAmount: 15000,
              measurements: {
                chest: '42"',
                waist: '36"',
                shoulder: '18"',
                length: '30"',
                sleeve: '25"'
              },
              customizations: {
                fabric: 'Merino Wool - Navy',
                style: 'Classic Fit',
                buttons: 'Horn Buttons',
                lining: 'Silk Lining',
                lapel: 'Notched Lapel'
              },
              specialInstructions: 'Extra attention to lapel stitching. Customer prefers slightly tapered fit.',
              attachments: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop']
            })}>
              <div className="job-image">
                <img 
                  src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop" 
                  alt="Three-Piece Suit" 
                />
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
                    strokeDasharray="75, 100"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="progress-text">75%</div>
              </div>
              <div className="job-info">
                <h3>Three-Piece Suit</h3>
                <p>Client: Mr. Harrison</p>
              </div>
              <div className="job-status">
                <span className="status-badge sewing">SEWING STAGE</span>
                <span className="due-date">DUE IN 2 DAYS</span>
              </div>
            </div>

            {/* Evening Gown */}
            <div className="job-card" onClick={() => handleOrderClick({
              _id: '2',
              garmentType: 'Evening Gown',
              customer: { 
                name: 'Sarah Jenkins',
                email: 'sarah.jenkins@email.com',
                phone: '+91 87654 32109',
                address: '456 Fashion Street, Delhi'
              },
              status: 'cutting',
              expectedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
              priority: 'Express',
              totalAmount: 25000,
              measurements: {
                bust: '36"',
                waist: '28"',
                hips: '38"',
                length: '58"',
                shoulder: '15"'
              },
              customizations: {
                fabric: 'Silk Chiffon - Burgundy',
                style: 'A-Line Silhouette',
                neckline: 'V-Neck',
                sleeves: 'Sleeveless',
                embellishments: 'Beaded Bodice'
              },
              specialInstructions: 'Handle with extra care. Customer is attending a wedding ceremony.',
              attachments: ['https://images.unsplash.com/photo-1566479179817-c0ae8e4b4b3d?w=200&h=200&fit=crop']
            })}>
              <div className="job-image">
                <img 
                  src="https://images.unsplash.com/photo-1566479179817-c0ae8e4b4b3d?w=200&h=200&fit=crop" 
                  alt="Evening Gown" 
                />
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
                    strokeDasharray="60, 100"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="progress-text">60%</div>
              </div>
              <div className="job-info">
                <h3>Evening Gown</h3>
                <p>Client: Sarah Jenkins</p>
              </div>
              <div className="job-status">
                <span className="status-badge cutting">CUTTING STAGE</span>
                <span className="due-date">DUE TOMORROW</span>
              </div>
            </div>

            {/* Tailored Blazer */}
            <div className="job-card" onClick={() => handleOrderClick({
              _id: '3',
              garmentType: 'Tailored Blazer',
              customer: { 
                name: 'Michael Chen',
                email: 'michael.chen@email.com',
                phone: '+91 76543 21098',
                address: '789 Corporate Plaza, Bangalore'
              },
              status: 'finishing',
              expectedDelivery: new Date(),
              priority: 'Urgent',
              totalAmount: 12000,
              measurements: {
                chest: '40"',
                waist: '34"',
                shoulder: '17"',
                length: '28"',
                sleeve: '24"'
              },
              customizations: {
                fabric: 'Wool Blend - Charcoal',
                style: 'Slim Fit',
                buttons: 'Metal Buttons',
                lining: 'Polyester Lining',
                lapel: 'Peak Lapel'
              },
              specialInstructions: 'Rush order for business presentation. Ensure perfect fit.',
              attachments: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop']
            })}>
              <div className="job-image">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" 
                  alt="Tailored Blazer" 
                />
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
                    strokeDasharray="90, 100"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="progress-text">90%</div>
              </div>
              <div className="job-info">
                <h3>Tailored Blazer</h3>
                <p>Client: Michael Chen</p>
              </div>
              <div className="job-status">
                <span className="status-badge final">FINAL PRESS</span>
                <span className="due-date">READY TODAY</span>
              </div>
            </div>

            {/* Silk Summer Dress */}
            <div className="job-card" onClick={() => handleOrderClick({
              _id: '4',
              garmentType: 'Silk Summer Dress',
              customer: { 
                name: 'Elena Rodriguez',
                email: 'elena.rodriguez@email.com',
                phone: '+91 65432 10987',
                address: '321 Garden View, Chennai'
              },
              status: 'pattern_making',
              expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
              priority: 'Standard',
              totalAmount: 8000,
              measurements: {
                bust: '34"',
                waist: '26"',
                hips: '36"',
                length: '42"',
                shoulder: '14"'
              },
              customizations: {
                fabric: 'Pure Silk - Floral Print',
                style: 'Fit and Flare',
                neckline: 'Round Neck',
                sleeves: 'Short Sleeves',
                closure: 'Back Zipper'
              },
              specialInstructions: 'Customer prefers loose fit around waist. Add pockets if possible.',
              attachments: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop']
            })}>
              <div className="job-image">
                <img 
                  src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop" 
                  alt="Silk Summer Dress" 
                />
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
                    strokeDasharray="20, 100"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="progress-text">20%</div>
              </div>
              <div className="job-info">
                <h3>Silk Summer Dress</h3>
                <p>Client: Elena Rodriguez</p>
              </div>
              <div className="job-status">
                <span className="status-badge pattern">PATTERN MAKING</span>
                <span className="due-date">DUE IN 5 DAYS</span>
              </div>
            </div>
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