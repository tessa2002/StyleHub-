import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FaUsers, FaPlus, FaSearch, FaEdit, FaTrash, FaEye,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt
} from 'react-icons/fa';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusColor = (status) => {
    const statusLower = (status || 'active').toLowerCase();
    switch (statusLower) {
      case 'active':
        return { bg: '#ECFDF5', text: '#059669' };
      case 'inactive':
        return { bg: '#FEF2F2', text: '#DC2626' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'blocked':
        return { bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      console.log('Fetching customers from /api/customers...');
      const response = await axios.get('/api/customers');
      console.log('Customers response:', response.data);
      
      // Handle the API response format: { success: true, customers: [...] }
      const customersData = response.data.customers || [];
      console.log('Customers data:', customersData);
      console.log('Number of customers:', customersData.length);
      
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      console.error('Error details:', error.response?.data);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`/api/customers/${customerId}`);
        setCustomers(customers.filter(c => (c._id || c.id) !== customerId));
        alert('Customer deleted successfully!');
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const filteredCustomers = Array.isArray(customers) ? customers.filter(customer => {
    const name = customer.name || '';
    const email = customer.email || '';
    const phone = customer.phone || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) : [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="customers-page">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading customers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="customers-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Customers Management</h1>
            <p>Manage your customer database</p>
          </div>
          <div className="header-actions">
            <Link to="/admin/customers/new" className="btn btn-primary">
              <FaPlus /> Add Customer
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => {
                const customerId = customer._id || customer.id;
                const customerName = customer.name || 'N/A';
                const customerPhone = customer.phone || 'N/A';
                const customerEmail = customer.email || 'N/A';
                const customerAddress = customer.address || 'N/A';
                const totalOrders = customer.totalOrders || 0;
                const customerStatus = customer.status || 'active';
                
                return (
                <tr key={customerId}>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{customerName}</div>
                      <div className="customer-id">ID: #{String(customerId).slice(-6)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="contact-item">
                        <FaPhone className="contact-icon" />
                        <span>{customerPhone}</span>
                      </div>
                      <div className="contact-item">
                        <FaEnvelope className="contact-icon" />
                        <span>{customerEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="address-info">
                      <FaMapMarkerAlt className="address-icon" />
                      <span>{customerAddress}</span>
                    </div>
                  </td>
                  <td>
                    <div className="orders-count">
                      <span className="count-badge">{totalOrders}</span>
                      <span className="count-label">orders</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: getStatusColor(customerStatus).bg,
                        color: getStatusColor(customerStatus).text,
                        display: 'inline-block',
                        textAlign: 'center',
                        minWidth: '80px'
                      }}
                    >
                      {customerStatus.charAt(0).toUpperCase() + customerStatus.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => window.location.href = `/admin/customers/${customer._id || customer.id}`}
                        className="btn-icon view"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => window.location.href = `/admin/customers/${customer._id || customer.id}/edit`}
                        className="btn-icon edit"
                        title="Edit Customer"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(customer._id || customer.id)}
                        className="btn-icon delete"
                        title="Delete Customer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>No customers found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Customers;