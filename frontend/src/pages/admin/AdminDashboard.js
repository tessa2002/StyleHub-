import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  FaUsers, FaShoppingBag, FaCalendarAlt, FaCut, FaUserTie,
  FaBell, FaCog, FaPlus, FaEye, FaChevronRight, FaArrowUp,
  FaArrowDown, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaSearch, FaFilter, FaFileExport, FaEllipsisH, FaBox, FaBrain
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyOrders: 0,
    dailyAppointments: 0,
    activeTailors: 0,
    revenueChange: 0,
    ordersChange: 0,
    appointmentsChange: 0,
    tailorsChange: 0
  });
  const [todaysFittings, setTodaysFittings] = useState([]);
  const [productionWorkflow, setProductionWorkflow] = useState({
    cutting: 0,
    stitching: 0,
    finishing: 0,
    ready: 0
  });
  const [workflowOrders, setWorkflowOrders] = useState({
    cutting: [],
    stitching: [],
    finishing: [],
    ready: []
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, appointmentsRes, usersRes] = await Promise.allSettled([
        axios.get('/api/orders'),
        axios.get('/api/appointments'),
        axios.get('/api/users')
      ]);

      // Process orders data
      const ordersData = ordersRes.status === 'fulfilled' ? ordersRes.value.data : {};
      const ordersArray = Array.isArray(ordersData.orders) ? ordersData.orders : [];

      // Process appointments data
      const appointmentsData = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data : {};
      const appointmentsArray = Array.isArray(appointmentsData.appointments) ? appointmentsData.appointments : [];

      // Process users data
      const usersData = usersRes.status === 'fulfilled' ? usersRes.value.data : {};
      const usersArray = Array.isArray(usersData.users) ? usersData.users : [];

      // Calculate total revenue
      const totalRevenue = ordersArray.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Calculate monthly orders
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyOrders = ordersArray.filter(order => {
        const orderDate = new Date(order.createdAt || order.date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      }).length;

      // Calculate daily appointments (today)
      const today = new Date().toDateString();
      const dailyAppointments = appointmentsArray.filter(apt => 
        new Date(apt.date || apt.appointmentDate).toDateString() === today
      ).length;

      // Calculate active tailors
      const activeTailors = usersArray.filter(user => user.role === 'Tailor').length;

      // Create today's fittings data
      const fittingsData = appointmentsArray
        .filter(apt => new Date(apt.date || apt.appointmentDate).toDateString() === today)
        .sort((a, b) => {
          const timeA = a.time || a.appointmentTime || '00:00';
          const timeB = b.time || b.appointmentTime || '00:00';
          return timeA.localeCompare(timeB);
        })
        .slice(0, 4)
        .map(apt => ({
          id: apt._id,
          time: formatTime(apt.time || apt.appointmentTime),
          customer: apt.customerName || apt.customer?.name || 'Unknown Customer',
          service: apt.service || apt.type || 'Fitting',
          type: apt.type || 'Bridal Gown'
        }));

      // Create recent orders data
      const recentOrdersData = ordersArray
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 4)
        .map(order => ({
          id: order.id || order._id,
          orderId: `#TF-${String(order.id || order._id).slice(-4)}`,
          client: order.customerName || order.customer?.name || 'Unknown Customer',
          garmentType: order.garmentType || order.items?.[0]?.name || 'Custom Garment',
          deadline: order.expectedDeliveryDate || order.expectedDelivery || order.deliveryDate,
          status: order.status || 'Order Placed',
          avatar: order.customer?.avatar || null
        }));

      // Calculate Production Workflow based on actual order statuses
      const workflowCounts = {
        cutting: 0,
        stitching: 0,
        finishing: 0,
        ready: 0
      };

      const workflowItems = {
        cutting: [],
        stitching: [],
        finishing: [],
        ready: []
      };

      ordersArray.forEach(order => {
        const status = (order.status || '').toLowerCase();
        const orderInfo = {
          id: order.id || order._id,
          client: order.customerName || order.customer?.name || 'Unknown',
          type: order.garmentType || order.itemType || 'Garment'
        };

        switch (status) {
          case 'cutting':
          case 'pattern making':
          case 'fabric cutting':
            workflowCounts.cutting++;
            if (workflowItems.cutting.length < 3) workflowItems.cutting.push(orderInfo);
            break;
          case 'stitching':
          case 'sewing':
          case 'in progress':
          case 'tailoring':
            workflowCounts.stitching++;
            if (workflowItems.stitching.length < 3) workflowItems.stitching.push(orderInfo);
            break;
          case 'finishing':
          case 'quality check':
          case 'final touches':
          case 'pressing':
          case 'trial':
            workflowCounts.finishing++;
            if (workflowItems.finishing.length < 3) workflowItems.finishing.push(orderInfo);
            break;
          case 'ready':
          case 'completed':
          case 'ready for pickup':
          case 'ready for delivery':
            workflowCounts.ready++;
            if (workflowItems.ready.length < 3) workflowItems.ready.push(orderInfo);
            break;
          default:
            break;
        }
      });

      setStats({
        totalRevenue,
        monthlyOrders,
        dailyAppointments,
        activeTailors,
        revenueChange: 12.5, // Mock data
        ordersChange: 5.2, // Mock data
        appointmentsChange: 0, // Mock data - "Today"
        tailorsChange: 0 // Mock data - "Active Now"
      });

      setTodaysFittings(fittingsData);
      setRecentOrders(recentOrdersData);
      setProductionWorkflow(workflowCounts);
      setWorkflowOrders(workflowItems);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '09:00 AM';
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'stitching': return '#e91e63';
      case 'ready': return '#10b981';
      case 'cutting': return '#f59e0b';
      case 'finishing': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'order placed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    const bgColor = `${color}20`;
    
    return (
      <span 
        className="status-badge"
        style={{ 
          backgroundColor: bgColor,
          color: color,
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          textTransform: 'uppercase'
        }}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not Set';
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Not Set';
    }
  };

  const getClientInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : names[0][0];
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="tailorflow-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="tailorflow-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">TF</div>
            <div className="logo-text">
              <h3>TailorFlow</h3>
              <p>Atelier Management</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item active">
            <div className="nav-icon-wrapper">
              <FaShoppingBag className="nav-icon" />
            </div>
            <span>Overview</span>
          </Link>
          <Link to="/admin/orders" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaShoppingBag className="nav-icon" />
            </div>
            <span>Orders</span>
          </Link>
          <Link to="/admin/appointments" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaCalendarAlt className="nav-icon" />
            </div>
            <span>Appointments</span>
          </Link>
          <Link to="/admin/staff" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaUserTie className="nav-icon" />
            </div>
            <span>Tailors</span>
          </Link>
          <Link to="/admin/inventory" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaBox className="nav-icon" />
            </div>
            <span>Inventory</span>
          </Link>
          <Link to="/admin/ml" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaBrain className="nav-icon" />
            </div>
            <span>🤖 AI/ML</span>
          </Link>
          
          <div className="nav-section-title">PREFERENCES</div>
          <Link to="/admin/settings" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaCog className="nav-icon" />
            </div>
            <span>Settings</span>
          </Link>
          
          <div className="nav-section-divider"></div>
          
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }} 
            className="nav-item logout-btn"
          >
            <div className="nav-icon-wrapper">
              <FaArrowDown className="nav-icon" style={{ transform: 'rotate(-90deg)' }} />
            </div>
            <span>Logout</span>
          </button>
        </nav>

        {/* New Order Button */}
        <div className="sidebar-footer">
          <button className="new-order-btn">
            <FaPlus />
            New Order
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Operations Overview</h1>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search orders, clients..." />
            </div>
            <button className="notification-btn">
              <FaBell />
            </button>
            <div className="user-profile">
              <span className="user-name">Elena Rossi</span>
              <span className="user-role">STORE MANAGER</span>
              <div className="user-avatar">ER</div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon revenue">
              <FaShoppingBag />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
              <div className="stat-change positive">
                +{stats.revenueChange}% <FaArrowUp />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">
              <FaShoppingBag />
            </div>
            <div className="stat-content">
              <div className="stat-label">Monthly Orders</div>
              <div className="stat-value">{stats.monthlyOrders}</div>
              <div className="stat-change positive">
                +{stats.ordersChange}% <FaArrowUp />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon appointments">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <div className="stat-label">Daily Appointments</div>
              <div className="stat-value">{stats.dailyAppointments}</div>
              <div className="stat-change neutral">
                Today
              </div>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/ml')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon tailors">
              <FaBrain />
            </div>
            <div className="stat-content">
              <div className="stat-label">AI/ML MODELS</div>
              <div className="stat-value">5 Active</div>
              <div className="stat-change positive">
                <FaCheckCircle /> Optimized
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Today's Fittings */}
          <div className="fittings-section">
            <div className="section-header">
              <h2>Today's Fittings</h2>
              <button className="view-all-btn">View All</button>
            </div>

            <div className="fittings-list">
              {todaysFittings.length > 0 ? (
                todaysFittings.map(fitting => (
                  <div key={fitting.id} className="fitting-item">
                    <div className="fitting-time">
                      <span className="time">{fitting.time}</span>
                    </div>
                    <div className="fitting-details">
                      <h4 className="customer-name">{fitting.customer}</h4>
                      <p className="fitting-type">{fitting.type} - {fitting.service}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-fittings">
                  <p>No fittings scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Production Workflow */}
          <div className="workflow-section">
            <div className="section-header">
              <h2>Production Workflow</h2>
              <div className="workflow-status">
                <span className={`status-indicator ${
                  (productionWorkflow.cutting + productionWorkflow.stitching + productionWorkflow.finishing) > 0 
                    ? 'in-progress' 
                    : 'idle'
                }`}></span>
                {(productionWorkflow.cutting + productionWorkflow.stitching + productionWorkflow.finishing) > 0 
                  ? 'IN PROGRESS' 
                  : 'IDLE'
                }
              </div>
            </div>
            <p className="workflow-subtitle">
              {(productionWorkflow.cutting + productionWorkflow.stitching + productionWorkflow.finishing + productionWorkflow.ready) > 0
                ? 'Active items in the production line'
                : 'No items currently in production'
              }
            </p>

            <div className="workflow-chart">
              {(() => {
                // Calculate the maximum value for proper scaling
                const maxValue = Math.max(
                  productionWorkflow.cutting,
                  productionWorkflow.stitching,
                  productionWorkflow.finishing,
                  productionWorkflow.ready,
                  1 // Minimum of 1 to avoid division by zero
                );
                
                return (
                  <>
                    <div className="workflow-bar cutting" style={{ height: `${(productionWorkflow.cutting / maxValue) * 100}%` }}>
                      <span className="bar-value">{productionWorkflow.cutting}</span>
                    </div>
                    <div className="workflow-bar stitching" style={{ height: `${(productionWorkflow.stitching / maxValue) * 100}%` }}>
                      <span className="bar-value">{productionWorkflow.stitching}</span>
                    </div>
                    <div className="workflow-bar finishing" style={{ height: `${(productionWorkflow.finishing / maxValue) * 100}%` }}>
                      <span className="bar-value">{productionWorkflow.finishing}</span>
                    </div>
                    <div className="workflow-bar ready" style={{ height: `${(productionWorkflow.ready / maxValue) * 100}%` }}>
                      <span className="bar-value">{productionWorkflow.ready}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="workflow-labels">
              <span>CUTTING</span>
              <span>STITCHING</span>
              <span>FINISHING</span>
              <span>READY</span>
            </div>

            {/* Current Workflow Detail View */}
            <div className="current-workflow">
              <div className="workflow-stage-column">
                {workflowOrders.cutting.map(order => (
                  <div key={order.id} className="workflow-item-mini">
                    <span className="dot cutting"></span>
                    <div className="item-info">
                      <p className="item-client">{order.client}</p>
                      <p className="item-type">{order.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="workflow-stage-column">
                {workflowOrders.stitching.map(order => (
                  <div key={order.id} className="workflow-item-mini">
                    <span className="dot stitching"></span>
                    <div className="item-info">
                      <p className="item-client">{order.client}</p>
                      <p className="item-type">{order.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="workflow-stage-column">
                {workflowOrders.finishing.map(order => (
                  <div key={order.id} className="workflow-item-mini">
                    <span className="dot finishing"></span>
                    <div className="item-info">
                      <p className="item-client">{order.client}</p>
                      <p className="item-type">{order.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="workflow-stage-column">
                {workflowOrders.ready.map(order => (
                  <div key={order.id} className="workflow-item-mini">
                    <span className="dot ready"></span>
                    <div className="item-info">
                      <p className="item-client">{order.client}</p>
                      <p className="item-type">{order.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="orders-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <div className="section-actions">
              <button className="filter-btn">
                <FaFilter /> Filter
              </button>
              <button className="export-btn">
                <FaFileExport /> Export CSV
              </button>
            </div>
          </div>

          <div className="orders-table">
            <div className="table-header">
              <span>ORDER ID</span>
              <span>CLIENT</span>
              <span>GARMENT TYPE</span>
              <span>DEADLINE</span>
              <span>STATUS</span>
              <span>ACTIONS</span>
            </div>

            {recentOrders.map(order => (
              <div key={order.id} className="table-row">
                <div className="order-id">{order.orderId}</div>
                <div className="client-info">
                  <div className="client-avatar">
                    {getClientInitials(order.client)}
                  </div>
                  <span className="client-name">{order.client}</span>
                </div>
                <div className="garment-type">{order.garmentType}</div>
                <div className="deadline">{formatDate(order.deadline)}</div>
                <div className="status">
                  {getStatusBadge(order.status)}
                </div>
                <div className="actions">
                  <button className="action-btn">
                    <FaEllipsisH />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;