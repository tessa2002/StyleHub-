import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TailorSidebar from '../../components/TailorSidebar';
import { 
  FaSearch, FaFilter, FaPlay, FaCheck, FaEye, FaTshirt,
  FaCalendarAlt, FaExclamationCircle, FaClock, FaUser,
  FaCheckCircle, FaSort, FaRedo
} from 'react-icons/fa';
import './MyOrders.css';

const MyOrders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, urgencyFilter, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching all orders for tailor...');
      
      const response = await axios.get('/api/orders/assigned');
      const allOrders = response.data.orders || response.data || [];
      
      setOrders(allOrders);
      console.log(`✅ Loaded ${allOrders.length} orders`);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter (Order ID or Dress Type)
    if (searchTerm) {
      filtered = filtered.filter(order => 
        String(order._id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.itemType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'not-started') {
        filtered = filtered.filter(order => 
          ['Pending', 'Order Placed'].includes(order.status)
        );
      } else if (statusFilter === 'in-progress') {
        filtered = filtered.filter(order => 
          ['Cutting', 'Stitching', 'Trial'].includes(order.status)
        );
      } else if (statusFilter === 'ready') {
        filtered = filtered.filter(order => 
          ['Ready', 'Delivered'].includes(order.status)
        );
      }
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(order => {
        const urgency = getUrgency(order);
        return urgency === urgencyFilter;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = new Date(a.expectedDelivery || a.deliveryDate);
        const dateB = new Date(b.expectedDelivery || b.deliveryDate);
        return dateA - dateB;
      } else if (sortBy === 'urgency') {
        const urgencyOrder = { 'very-urgent': 0, 'urgent': 1, 'normal': 2 };
        return urgencyOrder[getUrgency(a)] - urgencyOrder[getUrgency(b)];
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    setFilteredOrders(filtered);
  };

  const getUrgency = (order) => {
    const dueDate = new Date(order.expectedDelivery || order.deliveryDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0 || daysUntilDue === 0) return 'very-urgent';
    if (daysUntilDue <= 2) return 'urgent';
    return 'normal';
  };

  const getUrgencyLabel = (urgency) => {
    const labels = {
      'very-urgent': 'Very Urgent',
      'urgent': 'Urgent',
      'normal': 'Normal'
    };
    return labels[urgency] || 'Normal';
  };

  const getOrderStatus = (order) => {
    if (['Ready', 'Delivered'].includes(order.status)) return 'ready';
    if (['Cutting', 'Stitching', 'Trial'].includes(order.status)) return 'in-progress';
    return 'not-started';
  };

  const getOrderStatusLabel = (order) => {
    const status = getOrderStatus(order);
    const labels = {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      'ready': 'Completed - Ready'
    };
    return labels[status] || order.status;
  };

  const handleStartWork = async (orderId) => {
    if (!window.confirm('Start working on this order? It will move to In Progress.')) return;
    
    try {
      setActionLoading(orderId);
      console.log(`▶️ Starting work on order: ${orderId}`);

      // Call the start-work API
      await axios.put(`/api/orders/${orderId}/start-work`, {
        startedAt: new Date(),
        startedBy: user._id
      });

      // Refresh orders to update the list
      await fetchOrders();
      
      alert('✅ Work started! Order moved to In Progress. Admin and customer have been notified.');
      
      // Optionally navigate to order details
      // navigate(`/dashboard/tailor/order/${orderId}`);
    } catch (error) {
      console.error('❌ Error starting work:', error);
      alert('Failed to start work: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkReady = async (orderId) => {
    if (!window.confirm('Mark this order as ready for collection?')) return;

    try {
      setActionLoading(orderId);
      console.log(`✅ Marking order as ready: ${orderId}`);

      await axios.put(`/api/orders/${orderId}/mark-ready`, {
        completedAt: new Date(),
        completedBy: user._id
      });

      // Refresh orders
      await fetchOrders();
      
      alert('✅ Order marked as ready! Customer and staff have been notified.');
    } catch (error) {
      console.error('❌ Error marking as ready:', error);
      alert('Failed to mark as ready: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/dashboard/tailor/order/${orderId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not Set';
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short'
      });
    } catch (error) {
      return 'Not Set';
    }
  };

  const maskCustomerName = (name) => {
    if (!name) return 'Unknown';
    const parts = name.split(' ');
    if (parts.length === 1) return name;
    return `${parts[0]} ${parts[1]?.charAt(0)}.`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          <div className="my-orders-page">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tailor-layout">
      <TailorSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />
      <div className={`tailor-main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="my-orders-page">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-left">
              <h1>📋 My Orders</h1>
              <p>All orders assigned to you</p>
            </div>
            <button className="btn-refresh" onClick={fetchOrders} disabled={loading}>
              <FaRedo className={loading ? 'spinning' : ''} />
              Refresh
            </button>
          </div>

          {/* Filters & Search */}
          <div className="filters-section">
            {/* Search Bar */}
            <div className="search-box">
              <FaSearch />
              <input 
                type="text"
                placeholder="Search by Order ID or Dress Type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="filter-group">
              <div className="filter-item">
                <FaFilter />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="ready">Ready</option>
                </select>
              </div>

              <div className="filter-item">
                <FaExclamationCircle />
                <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
                  <option value="all">All Urgency</option>
                  <option value="very-urgent">Very Urgent</option>
                  <option value="urgent">Urgent</option>
                  <option value="normal">Normal</option>
                </select>
              </div>

              <div className="filter-item">
                <FaSort />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="urgency">Sort by Urgency</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="orders-summary">
            <div className="summary-item">
              <span className="label">Total Orders:</span>
              <span className="value">{filteredOrders.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Not Started:</span>
              <span className="value">{filteredOrders.filter(o => getOrderStatus(o) === 'not-started').length}</span>
            </div>
            <div className="summary-item">
              <span className="label">In Progress:</span>
              <span className="value">{filteredOrders.filter(o => getOrderStatus(o) === 'in-progress').length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Ready:</span>
              <span className="value">{filteredOrders.filter(o => getOrderStatus(o) === 'ready').length}</span>
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <FaTshirt className="empty-icon" />
              <h3>No Orders Found</h3>
              <p>
                {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all'
                  ? 'Try adjusting your filters or search term.'
                  : 'You have no orders assigned yet.'}
              </p>
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Dress Type</th>
                    <th>Order Date</th>
                    <th>Due Date</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const urgency = getUrgency(order);
                    const status = getOrderStatus(order);
                    const isActionLoading = actionLoading === order._id;

                    return (
                      <tr key={order._id} className={`order-row ${urgency}`}>
                        <td className="order-id-cell">
                          #{String(order._id).slice(-6).toUpperCase()}
                        </td>
                        <td>
                          <div className="customer-info">
                            <FaUser className="icon" />
                            {maskCustomerName(order.customer?.name || order.customerName)}
                          </div>
                        </td>
                        <td>
                          <div className="dress-type">
                            <FaTshirt className="icon" />
                            {order.itemType || 'Custom'}
                          </div>
                        </td>
                        <td>{formatDate(order.orderDate || order.createdAt)}</td>
                        <td>
                          <div className="due-date">
                            <FaCalendarAlt className="icon" />
                            {formatDate(order.expectedDelivery || order.deliveryDate)}
                          </div>
                        </td>
                        <td>
                          <span className={`urgency-badge ${urgency}`}>
                            {getUrgencyLabel(urgency)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${status}`}>
                            {getOrderStatusLabel(order)}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            {status === 'not-started' && (
                              <button 
                                className="btn-action btn-start"
                                onClick={() => handleStartWork(order._id)}
                                disabled={isActionLoading}
                              >
                                <FaPlay /> {isActionLoading ? 'Starting...' : 'Start Work'}
                              </button>
                            )}
                            {status === 'in-progress' && (
                              <button 
                                className="btn-action btn-ready"
                                onClick={() => handleMarkReady(order._id)}
                                disabled={isActionLoading}
                              >
                                <FaCheck /> {isActionLoading ? 'Updating...' : 'Mark Ready'}
                              </button>
                            )}
                            {status === 'ready' && (
                              <span className="completed-label">
                                <FaCheckCircle /> Completed
                              </span>
                            )}
                            <button 
                              className="btn-action btn-view"
                              onClick={() => handleViewDetails(order._id)}
                            >
                              <FaEye /> Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;

