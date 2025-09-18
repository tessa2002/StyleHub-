import React, { useState, useEffect } from 'react';
import TailorDashboardLayout from '../../../components/TailorDashboardLayout';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaClipboardList
} from 'react-icons/fa';
import axios from 'axios';
import './Customers.css';

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tailor/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  // Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  if (loading) {
    return (
      <TailorDashboardLayout title="Customer List">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading customers...</p>
        </div>
      </TailorDashboardLayout>
    );
  }

  return (
    <TailorDashboardLayout title="Customer List">
      <div className="customers-container">
        {/* Header */}
        <div className="customers-header">
          <div className="header-left">
            <h2>All Customers ({filteredCustomers.length})</h2>
            <p>Manage your customer database</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => navigate('/tailor/customers/new')}
          >
            <FaPlus />
            Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Customers Grid */}
        <div className="customers-grid-container">
          {currentCustomers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No customers found</h3>
              <p>
                {searchTerm 
                  ? 'No customers match your search criteria.' 
                  : 'You haven\'t added any customers yet. Start by adding your first customer.'
                }
              </p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/tailor/customers/new')}
              >
                <FaPlus />
                Add First Customer
              </button>
            </div>
          ) : (
            <div className="customers-grid">
              {currentCustomers.map(customer => (
                <div key={customer._id} className="customer-card">
                  <div className="customer-header">
                    <div className="customer-avatar">
                      <FaUser />
                    </div>
                    <div className="customer-info">
                      <h3>{customer.name}</h3>
                      <p className="customer-id">ID: {customer._id.slice(-6)}</p>
                    </div>
                  </div>
                  
                  <div className="customer-details">
                    <div className="detail-item">
                      <FaEnvelope className="detail-icon" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="detail-item">
                      <FaPhone className="detail-icon" />
                      <span>{customer.phone || 'No phone'}</span>
                    </div>
                    <div className="detail-item">
                      <FaClipboardList className="detail-icon" />
                      <span>{customer.totalOrders || 0} orders</span>
                    </div>
                  </div>

                  <div className="customer-actions">
                    <button
                      className="btn-icon view"
                      onClick={() => navigate(`/tailor/customers/${customer._id}`)}
                      title="View Customer"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-icon edit"
                      onClick={() => navigate(`/tailor/customers/${customer._id}/edit`)}
                      title="Edit Customer"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>
              ))}
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

export default CustomerList;
