import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FaShoppingBag, FaPlus, FaSearch, FaEdit, FaTrash,
  FaUser, FaCheckCircle, FaExclamationTriangle,
  FaFilter, FaUserTie, FaChevronDown, FaCog, FaSignOutAlt
} from 'react-icons/fa';
import './Orders.css';

const Orders = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Orders');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalOrders: 0,
    inProduction: 0,
    readyForPickup: 0,
    monthlyRevenue: 0,
    totalOrdersChange: 0,
    inProductionChange: 0,
    readyForPickupChange: 0,
    monthlyRevenueChange: 0
  });

  // Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTailorId, setSelectedTailorId] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchTailors();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Get auth token
      const token = localStorage.getItem('token');
      const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {};
      
      const response = await axios.get('/api/orders', { headers });
      const ordersData = response.data.orders || response.data || [];
      console.log('✅ Fetched orders:', ordersData.length);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
      // Calculate stats
      const totalOrders = ordersData.length;
      const inProduction = ordersData.filter(order => 
        ['Cutting', 'Stitching', 'Trial'].includes(order.status)
      ).length;
      const readyForPickup = ordersData.filter(order => 
        order.status === 'Ready'
      ).length;
      const monthlyRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({
        totalOrders,
        inProduction,
        readyForPickup,
        monthlyRevenue,
        totalOrdersChange: 12, // Mock data
        inProductionChange: 5,
        readyForPickupChange: -3,
        monthlyRevenueChange: 8
      });
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      console.error('❌ Error response:', error.response?.data);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTailors = async () => {
    try {
      // Get auth token
      const token = localStorage.getItem('token');
      const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {};
      
      const response = await axios.get('/api/staff/tailors', { headers });
      const tailorsList = response.data.users || (Array.isArray(response.data) ? response.data : []);
      console.log('✅ Fetched tailors for assignment:', tailorsList.length);
      setTailors(tailorsList);
    } catch (error) {
      console.error('❌ Error fetching tailors:', error.response?.data || error.message);
      console.error('❌ Full error:', error);
      setTailors([]);
    }
  };

  const handleAssignOrder = async () => {
    if (!selectedOrder || !selectedTailorId) {
      alert('Please select a tailor');
      return;
    }

    try {
      console.log('🔧 Assigning order:', selectedOrder._id, 'to tailor:', selectedTailorId);
      
      // Get auth token
      const token = localStorage.getItem('token');
      const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {};
      
      // Use the correct endpoint: PUT /api/orders/:id/assign
      const response = await axios.put(`/api/orders/${selectedOrder._id}/assign`, {
        tailorId: selectedTailorId
      }, { headers });

      console.log('✅ Assignment response:', response.data);

      // Update the order in the local state
      if (response.data.order) {
        setOrders(orders.map(order => 
          order._id === selectedOrder._id ? response.data.order : order
        ));
      }

      const assignedTailorName = tailors.find(t => t._id === selectedTailorId)?.name || 'Tailor';
      alert(`✅ Order assigned to ${assignedTailorName} successfully!`);
      setShowAssignModal(false);
      setSelectedOrder(null);
      setSelectedTailorId('');
      
      // Refresh orders to get updated data
      await fetchOrders();
    } catch (error) {
      console.error('❌ Error assigning tailor:', error);
      console.error('❌ Error response:', error.response?.data);
      alert('Failed to assign tailor: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenAssignModal = (order) => {
    console.log('🎯 Opening assign modal for order:', order._id);
    setSelectedOrder(order);
    setSelectedTailorId('');
    setShowAssignModal(true);
  };

  const getFilteredOrders = () => {
    let filtered = orders.filter(order => {
      const customerName = order.customer?.name || order.customerName || '';
      const garmentType = order.itemType || order.garmentType || order.items?.[0]?.name || 'Custom Order';
      const orderId = order._id || order.id || '';
      
      const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           garmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           orderId.toString().includes(searchTerm);
      return matchesSearch;
    });

    // Filter by tab
    switch (activeTab) {
      case 'Cutting':
        filtered = filtered.filter(order => order.status === 'Cutting');
        break;
      case 'Sewing':
        filtered = filtered.filter(order => order.status === 'Stitching');
        break;
      case 'Quality Check':
        filtered = filtered.filter(order => order.status === 'Trial');
        break;
      case 'Ready':
        filtered = filtered.filter(order => order.status === 'Ready');
        break;
      default:
        // All Orders - no additional filtering
        break;
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Cutting': return '#8b5cf6';
      case 'Stitching': case 'SEWING': return '#e91e63';
      case 'Trial': case 'QC': return '#f59e0b';
      case 'Ready': case 'READY': return '#10b981';
      case 'Delivered': return '#059669';
      case 'Order Placed': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    let displayStatus = status;
    
    // Map status for display
    if (status === 'Stitching') displayStatus = 'SEWING';
    if (status === 'Trial') displayStatus = 'QC';
    if (status === 'Ready') displayStatus = 'READY';
    
    return (
      <span 
        className="status-badge"
        style={{ 
          backgroundColor: `${color}20`,
          color: color,
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {displayStatus}
      </span>
    );
  };

  const getPriorityBadge = (priority = 'Standard') => {
    const isHigh = priority === 'High' || priority === 'Urgent';
    return (
      <span 
        className="priority-badge"
        style={{ 
          backgroundColor: isHigh ? '#fef2f2' : '#f3f4f6',
          color: isHigh ? '#dc2626' : '#6b7280',
          padding: '2px 6px',
          borderRadius: '8px',
          fontSize: '9px',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}
      >
        {isHigh && '!'}
        {priority}
      </span>
    );
  };

  const getClientInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : names[0][0];
  };

  const filteredOrders = getFilteredOrders();
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="stitchmaster-orders loading">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="stitchmaster-orders">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">SM</div>
            <div className="logo-text">
              <h3>StitchMaster</h3>
              <p>Tailoring Admin</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaShoppingBag className="nav-icon" />
            </div>
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/orders" className="nav-item active">
            <div className="nav-icon-wrapper">
              <FaShoppingBag className="nav-icon" />
            </div>
            <span>Orders</span>
          </Link>
          <Link to="/admin/customers" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaUser className="nav-icon" />
            </div>
            <span>Clients</span>
          </Link>
          <Link to="/admin/staff" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaUserTie className="nav-icon" />
            </div>
            <span>Tailors</span>
          </Link>
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
              <FaSignOutAlt className="nav-icon" />
            </div>
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="support-btn">
            <FaBell />
            Support Center
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-left">
            <h1>Order Management</h1>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search orders, clients or garments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="notification-btn">
              <FaBell />
            </button>
            <div className="user-profile">
              <div className="user-avatar">A</div>
            </div>
            <button className="new-order-btn">
              <FaPlus />
              New Order
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">TOTAL ORDERS</div>
              <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
              <div className="stat-change positive">
                +{stats.totalOrdersChange}% <FaArrowUp />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">IN PRODUCTION</div>
              <div className="stat-value">{stats.inProduction}</div>
              <div className="stat-change positive">
                +{stats.inProductionChange}% <FaArrowUp />
              </div>
            </div>
          </div>

          <div className="stat-card highlighted">
            <div className="stat-content">
              <div className="stat-label">READY FOR PICKUP</div>
              <div className="stat-value">{stats.readyForPickup}</div>
              <div className="stat-change negative">
                {stats.readyForPickupChange}% <FaArrowDown />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">MONTHLY REVENUE</div>
              <div className="stat-value">${stats.monthlyRevenue.toLocaleString()}</div>
              <div className="stat-change positive">
                +{stats.monthlyRevenueChange}% <FaArrowUp />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Workflow Section */}
        <div className="workflow-section">
          <div className="section-header">
            <h2>Recent Workflow</h2>
          </div>

          {/* Workflow Tabs */}
          <div className="workflow-tabs">
            {['All Orders', 'Cutting', 'Sewing', 'Quality Check', 'Ready'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="orders-table">
            <div className="table-header">
              <span>ORDER ID</span>
              <span>CUSTOMER</span>
              <span>GARMENT TYPE</span>
              <span>STATUS</span>
              <span>PRIORITY</span>
              <span>ACTION</span>
            </div>

            {paginatedOrders.map(order => {
              const orderId = order._id?.toString() || order.id;
              const customerName = order.customer?.name || order.customerName || 'Unknown Customer';
              const garmentType = order.itemType || order.garmentType || order.items?.[0]?.name || 'Custom Order';
              
              return (
                <div key={orderId} className="table-row">
                  <div className="order-id">
                    <span className="id-text">#{orderId.slice(-4).toUpperCase()}</span>
                  </div>
                  <div className="customer-info">
                    <div className="customer-avatar">
                      {getClientInitials(customerName)}
                    </div>
                    <span className="customer-name">{customerName}</span>
                  </div>
                  <div className="garment-type">{garmentType}</div>
                  <div className="status">
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="priority">
                    {getPriorityBadge(order.priority)}
                  </div>
                  <div className="actions">
                    {/* Show assign button for unassigned orders with status "Order Placed" */}
                    {(!order.assignedTailor || order.assignedTailor === null) && 
                     ['Order Placed', 'Pending'].includes(order.status) ? (
                      <button 
                        className="assign-btn"
                        onClick={() => handleOpenAssignModal(order)}
                        title="Assign to Tailor"
                      >
                        <FaUserTie />
                        Assign
                      </button>
                    ) : order.assignedTailor ? (
                      <span className="assigned-status" title={`Assigned to: ${order.assignedTailor?.name || 'Tailor'}`}>
                        <FaCheckCircle />
                        Assigned
                      </span>
                    ) : (
                      <button className="action-btn" title="More actions">
                        <FaEllipsisH />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span className="pagination-info">
              Showing {startIndex + 1} of {filteredOrders.length} results
            </span>
            <div className="pagination-controls">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>
              <span className="page-number active">{currentPage}</span>
              {currentPage < totalPages && (
                <span className="page-number">{currentPage + 1}</span>
              )}
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Tailor to Order</h2>
              <button onClick={() => setShowAssignModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="order-info">
                <p><strong>Order ID:</strong> #{selectedOrder?._id?.toString().slice(-6)}</p>
                <p><strong>Customer:</strong> {selectedOrder?.customer?.name || 'N/A'}</p>
                <p><strong>Amount:</strong> ₹{(selectedOrder?.totalAmount || 0).toLocaleString()}</p>
              </div>

              <div className="form-group">
                <label>Select Tailor:</label>
                <select
                  value={selectedTailorId}
                  onChange={(e) => setSelectedTailorId(e.target.value)}
                >
                  <option value="">-- Select a Tailor --</option>
                  {tailors.map(tailor => (
                    <option key={tailor._id} value={tailor._id}>
                      {tailor.name} - {tailor.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button onClick={handleAssignOrder} disabled={!selectedTailorId}>
                Assign Tailor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;