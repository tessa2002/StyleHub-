import React, { useState, useEffect } from 'react';
import TailorDashboardLayout from '../../../components/TailorDashboardLayout';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaUser,
  FaRupeeSign
} from 'react-icons/fa';
import axios from 'axios';
import './Orders.css';

const AllOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tailor/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Set empty array for no data
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`/api/tailor/orders/${orderId}`);
        setOrders(orders.filter(order => order._id !== orderId));
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Failed to delete order:', error);
        alert('Failed to delete order. Please try again.');
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/tailor/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesDate = dateFilter === 'all' || (() => {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today': return daysDiff === 0;
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        default: return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#10b981';
      case 'in progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  if (loading) {
    return (
      <TailorDashboardLayout title="All Orders">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </TailorDashboardLayout>
    );
  }

  return (
    <TailorDashboardLayout title="All Orders">
      <div className="orders-container">
        {/* Header Actions */}
        <div className="orders-header">
          <div className="header-left">
            <h2>All Orders ({filteredOrders.length})</h2>
            <p>Manage all your orders from here</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => navigate('/tailor/orders/new')}
          >
            <FaPlus />
            New Order
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search orders by number, customer, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <div className="filter-item">
              <FaFilter />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="filter-item">
              <FaCalendarAlt />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          {currentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No orders found</h3>
              <p>No orders match your current filters. Try adjusting your search criteria.</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/tailor/orders/new')}
              >
                <FaPlus />
                Create First Order
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Delivery Date</th>
                    <th>Amount</th>
                    <th>Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <div className="order-number">
                          {order.orderNumber}
                        </div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">
                            <FaUser />
                            {order.customerName}
                          </div>
                          <div className="customer-phone">{order.customerPhone}</div>
                        </div>
                      </td>
                      <td>
                        <span className="service-type">{order.serviceType}</span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          <option value={order.status}>{order.status}</option>
                          {getStatusOptions(order.status).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="delivery-date">
                          <FaCalendarAlt />
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="amount">
                          <FaRupeeSign />
                          {formatCurrency(order.amount)}
                        </div>
                      </td>
                      <td>
                        <div className="balance">
                          {formatCurrency(order.amount - (order.advancePayment || 0))}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon view"
                            onClick={() => navigate(`/tailor/orders/${order._id}`)}
                            title="View Order"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn-icon edit"
                            onClick={() => navigate(`/tailor/orders/${order._id}/edit`)}
                            title="Edit Order"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeleteOrder(order._id)}
                            title="Delete Order"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </TailorDashboardLayout>
  );
};

export default AllOrders;
